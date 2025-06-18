// Fix for saving issues in the virtual assistant
// Ensure proper state management and API calls

const saveVirtualAssistant = async (data) => {
  try {
    const response = await axios.post('https://ai-virual-backend1.onrender.com/api/assistant/save', data, { withCredentials: true });
    if (response.status === 200) {
      console.log('Assistant saved successfully!');
    } else {
      console.error('Failed to save assistant:', response.data);
    }
  } catch (error) {
    console.error('Error saving assistant:', error);
  }
};

// Ensure this function is called appropriately in your component