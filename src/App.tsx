import { useState, KeyboardEvent } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Chip,
  Divider
} from '@mui/material';

import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import { GOOGLE_API_KEY } from './config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h3: {
      fontSize: '2.5rem',
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    subtitle1: {
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

interface StoryContent {
  title: string;
  content: string;
  summary: string;
  genre: string;
  wordCount: number;
}

function App() {
  const [topic, setTopic] = useState<string>('');
  const [story, setStory] = useState<StoryContent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const isMobile = useMediaQuery('(max-width:600px)');
  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

  const calculateReadingTime = (wordCount: number): string => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      generateStory();
    }
  };

  const generateStory = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setStory(null);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      // Generate title and genre
      const titlePrompt = `Generate a creative and captivating title for a story about "${topic}".
                          Also suggest a fitting genre for this story.
                          Format the response as:
                          TITLE: [your title]
                          GENRE: [genre]`;
      
      const titleResult = await model.generateContent(titlePrompt);
      const titleResponse = await titleResult.response;
      const titleData = titleResponse.text().split('\n');
      const generatedTitle = titleData[0].replace('TITLE:', '').trim();
      const genre = titleData[1].replace('GENRE:', '').trim();

      // Generate the full story
      const storyPrompt = `Write an engaging story about ${topic}.
                          Title: "${generatedTitle}"
                          Genre: ${genre}
                          
                          Requirements:
                          1. Length: Around 800-1000 words
                          2. Structure the story with clear sections:
                             - Opening/Hook (captivating introduction)
                             - Character Introduction
                             - Rising Action
                             - Climax
                             - Resolution
                          3. Use descriptive language and dialogue
                          4. Include sensory details
                          5. End with a meaningful conclusion
                          
                          Format the story with clear paragraph breaks and section spacing.
                          Start with a brief one-sentence summary of the story.
                          
                          Format as:
                          SUMMARY: [one-line summary]
                          
                          STORY:
                          [full story with proper formatting]`;

      const storyResult = await model.generateContent(storyPrompt);
      const storyResponse = await storyResult.response;
      const fullText = storyResponse.text();
      
      // Extract summary and main story content
      const summaryMatch = fullText.match(/SUMMARY:(.*?)STORY:/s);
      const summary = summaryMatch ? summaryMatch[1].trim() : '';
      const content = fullText.split('STORY:')[1].trim();
      
      // Calculate word count
      const wordCount = content.split(/\s+/).length;

      setStory({
        title: generatedTitle,
        content: formatStoryContent(content),
        summary,
        genre,
        wordCount
      });
    } catch (err) {
      setError('Failed to generate story. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatStoryContent = (content: string) => {
    return content
      .replace(/\n\n/g, '\n')
      .trim();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box sx={{ 
          my: isMobile ? 2 : 4, 
          textAlign: 'center',
          px: isMobile ? 2 : 0
        }}>
          <AutoStoriesIcon 
            sx={{ 
              fontSize: isMobile ? 40 : 60, 
              color: 'primary.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h3" component="h1" gutterBottom>
            Story Generator
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mb: isMobile ? 2 : 4 }}
          >
            Enter any topic and let AI create a unique story for you!
          </Typography>

          <Box sx={{ mb: isMobile ? 2 : 4 }}>
            <TextField
              fullWidth
              label="Enter your topic"
              variant="outlined"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{ mb: 2 }}
              placeholder="e.g., space exploration, lost cat, magical forest"
              multiline
              rows={isMobile ? 2 : 1}
            />
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={generateStory}
              disabled={loading}
              sx={{ 
                minWidth: isMobile ? 150 : 200,
                height: isMobile ? '40px' : '48px'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Story'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {story && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: isMobile ? 2 : 3, 
                textAlign: 'left',
                backgroundColor: '#ffffff',
                borderRadius: 2,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                }
              }}
            >
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}
              >
                {story.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  icon={<CategoryIcon />} 
                  label={story.genre} 
                  color="primary" 
                  sx={{ marginRight: 1 }} 
                />
                <Chip 
                  icon={<AccessTimeIcon />} 
                  label={calculateReadingTime(story.wordCount)} 
                  color="secondary" 
                />
              </Box>

              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Summary: {story.summary}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  lineHeight: 1.8,
                  '& p': {
                    mb: 2
                  }
                }}
              >
                {story.content}
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;