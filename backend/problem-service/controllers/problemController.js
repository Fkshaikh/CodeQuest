const Problem = require('../../models/Problem');

exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.findAll({
      attributes: ['id', 'title', 'difficulty'],
    });
    
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problems', error: error.message });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByPk(id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problem', error: error.message });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, constraints, examples, testCases, solutionTemplate } = req.body;
    
    const problem = await Problem.create({
      title,
      description,
      difficulty,
      constraints,
      examples,
      testCases: JSON.stringify(testCases),
      solutionTemplate,
    });
    
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating problem', error: error.message });
  }
}; 