// src/utils/judge0Service.js
const { judge0Api, LANGUAGE_IDS } = require('../config/judge0');

/**
 * Submit code to Judge0 for execution
 * @param {string} sourceCode - The source code to execute
 * @param {string} language - The programming language
 * @param {string} stdin - The standard input (optional)
 * @param {object} options - Additional options (optional)
 * @returns {Promise<object>} - The submission token
 */
const submitCode = async (sourceCode, language, stdin = '', options = {}) => {
  try {
    // Validate language
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Prepare submission data (Judge0 CE format)
    const submissionData = {
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin || '',
      wait: false,
      ...options
    };

    // Submit code to Judge0
    const response = await judge0Api.post('/submissions', submissionData);
    
    if (!response.data || !response.data.token) {
      throw new Error('Failed to get submission token');
    }

    return {
      token: response.data.token,
      status: 'submitted'
    };
  } catch (error) {
    console.error('Judge0 submission error:', error);
    throw new Error(`Code submission failed: ${error.message}`);
  }
};

/**
 * Get submission status and result from Judge0
 * @param {string} token - The submission token
 * @returns {Promise<object>} - The submission status and result
 */
const getSubmissionResult = async (token) => {
  try {
    const response = await judge0Api.get(`/submissions/${token}?fields=status_id,status,stdout,stderr,compile_output,message,time,memory,exit_code,token`);
    
    const result = response.data;
    
    return {
      status: result.status.id,
      statusDescription: result.status.description,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      message: result.message || '',
      time: result.time,
      memory: result.memory,
      exit_code: result.exit_code,
      token: result.token
    };
  } catch (error) {
    console.error('Judge0 result fetch error:', error);
    throw new Error(`Failed to get submission result: ${error.message}`);
  }
};

/**
 * Poll for submission result until it's completed or timeout
 * @param {string} token - The submission token
 * @param {number} maxAttempts - Maximum number of polling attempts
 * @param {number} interval - Polling interval in milliseconds
 * @returns {Promise<object>} - The final submission result
 */
const pollSubmissionResult = async (token, maxAttempts = 10, interval = 1000) => {
  let attempts = 0;
  
  // Status IDs that indicate the submission is still processing
  const processingStatuses = [1, 2]; // 1: In Queue, 2: Processing
  
  while (attempts < maxAttempts) {
    const result = await getSubmissionResult(token);
    
    // If submission is not in processing status, return the result
    if (!processingStatuses.includes(result.status)) {
      return result;
    }
    
    // Wait for the specified interval before polling again
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }
  
  throw new Error('Submission processing timeout');
};

/**
 * Format the execution result for better readability
 * @param {object} result - The raw execution result
 * @returns {object} - The formatted result
 */
const formatExecutionResult = (result) => {
  // Define status descriptions
  const statusDescriptions = {
    3: 'Accepted',
    4: 'Wrong Answer',
    5: 'Time Limit Exceeded',
    6: 'Compilation Error',
    7: 'Runtime Error',
    8: 'Internal Error',
    9: 'Execution Timeout',
    10: 'Compilation Timeout',
    11: 'Compilation Error',
    12: 'Runtime Error'
  };

  // Format the result
  return {
    status: result.status,
    statusDescription: statusDescriptions[result.status] || result.statusDescription,
    output: result.stdout,
    error: result.stderr || result.compile_output || result.message || '',
    executionTime: result.time,
    memory: result.memory,
    exitCode: result.exit_code
  };
};

/**
 * Execute code and return the formatted result
 * @param {string} sourceCode - The source code to execute
 * @param {string} language - The programming language
 * @param {string} stdin - The standard input (optional)
 * @param {object} options - Additional options (optional)
 * @returns {Promise<object>} - The formatted execution result
 */
const executeCode = async (sourceCode, language, stdin = '', options = {}) => {
  try {
    // Submit code
    const submission = await submitCode(sourceCode, language, stdin, options);
    
    // Poll for result
    const result = await pollSubmissionResult(submission.token);
    
    // Format and return result
    return formatExecutionResult(result);
  } catch (error) {
    console.error('Code execution error:', error);
    return {
      status: 'error',
      statusDescription: 'Execution Failed',
      output: '',
      error: error.message,
      executionTime: null,
      memory: null,
      exitCode: null
    };
  }
};

module.exports = {
  submitCode,
  getSubmissionResult,
  pollSubmissionResult,
  formatExecutionResult,
  executeCode
}; 