import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
  strengths: string;
  weaknesses: string;
  missing_sections: string;
  resume_suggestions: string;
  github_tips: string;
}

async function fetchGitHubProfile(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) return null;
    const userData = await response.json();
    
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
    const repos = reposResponse.ok ? await reposResponse.json() : [];
    
    return {
      username: userData.login,
      name: userData.name,
      bio: userData.bio,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      recentRepos: repos.map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
      })),
    };
  } catch (error) {
    return null;
  }
}

function extractGitHubUsername(url: string): string | null {
  const match = url.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const githubUrl = formData.get('githubUrl') as string;

    if (!file) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    let githubInfo = null;
    if (githubUrl) {
      const username = extractGitHubUsername(githubUrl);
      if (username) {
        githubInfo = await fetchGitHubProfile(username);
      }
    }

    const githubContext = githubInfo
      ? `GitHub Profile:
- Username: ${githubInfo.username}
- Name: ${githubInfo.name || 'N/A'}
- Bio: ${githubInfo.bio || 'N/A'}
- Public Repos: ${githubInfo.publicRepos}
- Followers: ${githubInfo.followers}
- Following: ${githubInfo.following}
- Recent Repos: ${githubInfo.recentRepos.map((r: any) => `${r.name} (${r.language || 'N/A'}) - ${r.stars} stars`).join(', ')}`
      : 'No GitHub profile provided.';

    const prompt = `You are a helpful career advisor analyzing a resume and GitHub profile. Provide feedback in a conversational, human style as if you're giving advice to a friend.

Resume Text:
${resumeText}

${githubContext}

Provide your analysis as a JSON object with these exact keys:
- strengths: What the candidate does well (2-3 sentences, conversational tone)
- weaknesses: Areas for improvement (2-3 sentences, constructive and friendly)
- missing_sections: Any important sections missing from the resume (1-2 sentences)
- resume_suggestions: Specific actionable suggestions to improve the resume (3-4 sentences)
- github_tips: Advice for improving their GitHub profile or showcasing projects better (2-3 sentences, or "No GitHub profile provided" if none)

Keep the tone warm, encouraging, and conversational. Return ONLY valid JSON, no markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful career advisor. Always respond with valid JSON only, no markdown or code blocks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const analysisText = completion.choices[0]?.message?.content || '{}';
    const analysis: AnalysisResult = JSON.parse(analysisText);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
