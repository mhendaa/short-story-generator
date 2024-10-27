// StoryContent.jsx
import React from 'react';
import { Typography } from '@mui/material';

const StoryContent = ({ content }) => {
  const formatStoryContent = (content) => {
    const formattedContent = content.split(/\n/g).map((line, index) => {
      const parts = line.split(/(\*\*(.*?)\*\*)/g); // Split by bold markers
      return (
        <Typography key={index} variant="body1" sx={{ mb: 2 }}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <span key={i} style={{ fontWeight: 'bold' }}>
                  {part.slice(2, -2)} {/* Remove the bold markers */}
                </span>
              );
            }
            return part; // Return normal text
          })}
        </Typography>
      );
    });

    return <>{formattedContent}</>;
  };

  return (
    <div>
      {formatStoryContent(content)}
    </div>
  );
};

export default StoryContent;