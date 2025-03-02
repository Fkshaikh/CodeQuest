const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');


const execPromise = util.promisify(exec);
const writeFilePromise = util.promisify(fs.writeFile);
const unlinkPromise = util.promisify(fs.unlink);

exports.executeCode = async (req, res) => {
  try {
    const result = await exports.executeCodeInternal(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'Runtime Error',
      errorMessage: error.message,
    });
  }
};

exports.executeCodeInternal = async (data) => {
  const { submissionId, problemId, code, language } = data;
  
  // Create temporary directory for code execution
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  // Get problem test cases
  let testCases;
  try {
    const Problem = require('../../models/Problem');
    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      return {
        status: 'Compilation Error',
        errorMessage: 'Problem not found'
      };
    }
    testCases = JSON.parse(problem.testCases);
  } catch (error) {
    return {
      status: 'Compilation Error',
      errorMessage: 'Failed to fetch problem test cases'
    };
  }
  
  // File paths for code and output
  const codeFilePath = path.join(tempDir, `submission_${submissionId}.${getFileExtension(language)}`);
  
  try {
    // Write code to file
    await writeFilePromise(codeFilePath, code);
    
    // Compile and run based on language
    let compileCommand, runCommand;
    
    switch (language.toLowerCase()) {
      case 'javascript':
        compileCommand = null;
        runCommand = `node ${codeFilePath}`;
        break;
      case 'python':
        compileCommand = null;
        runCommand = `python ${codeFilePath}`;
        break;
      case 'java':
        const className = 'Solution'; // Assuming the class name is Solution
        compileCommand = `javac ${codeFilePath}`;
        runCommand = `java -cp ${tempDir} ${className}`;
        break;
      case 'c++':
        const outputPath = path.join(tempDir, `submission_${submissionId}`);
        compileCommand = `g++ ${codeFilePath} -o ${outputPath}`;
        runCommand = outputPath;
        break;
      default:
        throw new Error('Unsupported language');
    }
    
    // Compile if needed
    if (compileCommand) {
      try {
        await execPromise(compileCommand);
      } catch (compileError) {
        return {
          status: 'Compilation Error',
          errorMessage: compileError.stderr,
        };
      }
    }
    
    // Run against test cases
    let allTestsPassed = true;
    let executionTime = 0;
    let errorMessage = null;
    
    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        // Prepare input for the test case
        const inputFile = path.join(tempDir, `input_${submissionId}.txt`);
        await writeFilePromise(inputFile, testCase.input);
        
        // Run with input
        const { stdout, stderr } = await execPromise(`${runCommand} < ${inputFile}`);
        
        // Calculate execution time
        const endTime = Date.now();
        executionTime += (endTime - startTime);
        
        // Clean up input file
        await unlinkPromise(inputFile);
        
        // Check output
        const expectedOutput = testCase.output.trim();
        const actualOutput = stdout.trim();
        
        if (actualOutput !== expectedOutput) {
          allTestsPassed = false;
          errorMessage = `Expected: ${expectedOutput}\nGot: ${actualOutput}`;
          break;
        }
      } catch (runError) {
        allTestsPassed = false;
        errorMessage = runError.stderr || runError.message;
        break;
      }
    }
    
    // Clean up code file
    await unlinkPromise(codeFilePath);
    
    // Return result
    return {
      status: allTestsPassed ? 'Accepted' : 'Wrong Answer',
      executionTime,
      memoryUsed: 0,
      errorMessage,
    };
    
  } catch (error) {
    // Clean up if possible
    try {
      if (fs.existsSync(codeFilePath)) {
        await unlinkPromise(codeFilePath);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    return {
      status: 'Runtime Error',
      errorMessage: error.message,
    };
  }
};

function getFileExtension(language) {
  switch (language.toLowerCase()) {
    case 'javascript': return 'js';
    case 'python': return 'py';
    case 'java': return 'java';
    case 'c++': return 'cpp';
    default: return 'txt';
  }
} 