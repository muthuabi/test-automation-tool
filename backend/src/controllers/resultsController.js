const Result = require('../models/resultsModel');
const { validateAndConvertId } = require('../utils/idValidator');

exports.getResults = async (req, res) => {
  try {
    const results = await Result.find().populate('runId').populate('functionId');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      validateAndConvertId(id, 'Result ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const result = await Result.findById(id).populate('runId').populate('functionId');
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResultsByRun = async (req, res) => {
  try {
    const { runId } = req.params;
    
    try {
      validateAndConvertId(runId, 'Run ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const results = await Result.find({ runId }).populate('functionId');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResultsByScenario = async (req, res) => {
  try {
    const scenarioName = req.params.scenarioName;
    const results = await Result.find({ scenarioName }).populate('runId').populate('functionId');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      validateAndConvertId(id, 'Result ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const result = await Result.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json({ message: 'Result deleted successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get execution logs for a specific run
 * Returns all logs in chronological order with detailed system, browser, function info
 */
exports.getExecutionLogs = async (req, res) => {
  try {
    const { runId } = req.params;
    
    try {
      validateAndConvertId(runId, 'Run ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Get all results for this run, including execution summary
    const results = await Result.find({ runId }).sort({ createdAt: 1 });
    
    if (results.length === 0) {
      return res.json({
        runId,
        logs: [],
        summary: {
          totalResults: 0,
          passed: 0,
          failed: 0,
          message: 'No execution logs found for this run',
        },
      });
    }

    // Find execution summary (marked with EXECUTION_SUMMARY or EXECUTION_ERROR)
    const executionSummary = results.find(
      r => r.functionName === '[EXECUTION_SUMMARY]' || r.functionName === '[EXECUTION_ERROR]'
    );
    const functionResults = results.filter(
      r => r.functionName !== '[EXECUTION_SUMMARY]' && r.functionName !== '[EXECUTION_ERROR]'
    );

    // Compile all logs
    const allLogs = [];
    
    if (executionSummary && executionSummary.logs) {
      allLogs.push(...executionSummary.logs);
    } else {
      // If no execution summary, construct from individual results
      allLogs.push('[FALLBACK] No execution summary found, constructing from results...');
    }

    // Add individual function results
    functionResults.forEach(result => {
      allLogs.push(`\n[${result.functionName}]`);
      if (result.logs && Array.isArray(result.logs)) {
        allLogs.push(...result.logs);
      }
      if (result.error) {
        allLogs.push(`ERROR: ${result.error}`);
      }
      allLogs.push(`Status: ${result.status} | Duration: ${result.duration}ms`);
    });

    // Calculate summary stats
    const passed = functionResults.filter(r => r.status === 'passed').length;
    const failed = functionResults.filter(r => r.status === 'failed').length;

    res.json({
      runId,
      logs: allLogs,
      summary: {
        totalResults: functionResults.length,
        passed,
        failed,
        executionStarted: results[0]?.createdAt,
        executionEnded: executionSummary?.endTime || results[results.length - 1]?.endTime,
        status: executionSummary?.status || 'unknown',
        error: executionSummary?.error || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get execution summary for a run with key metrics
 */
exports.getExecutionSummary = async (req, res) => {
  try {
    const { runId } = req.params;
    
    try {
      validateAndConvertId(runId, 'Run ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const results = await Result.find({ runId });
    
    if (results.length === 0) {
      return res.status(404).json({
        error: 'No execution results found for this run',
      });
    }

    const functionResults = results.filter(
      r => r.functionName !== '[EXECUTION_SUMMARY]' && r.functionName !== '[EXECUTION_ERROR]'
    );
    const executionSummary = results.find(r => r.functionName === '[EXECUTION_SUMMARY]' || r.functionName === '[EXECUTION_ERROR]');

    const passed = functionResults.filter(r => r.status === 'passed').length;
    const failed = functionResults.filter(r => r.status === 'failed').length;
    const totalDuration = functionResults.reduce((acc, r) => acc + (r.duration || 0), 0);

    res.json({
      runId,
      executionStatus: executionSummary?.status || 'unknown',
      functionCount: functionResults.length,
      passedCount: passed,
      failedCount: failed,
      totalDuration: totalDuration,
      averageFunctionDuration: functionResults.length > 0 ? Math.round(totalDuration / functionResults.length) : 0,
      startTime: results[0]?.createdAt,
      endTime: executionSummary?.endTime || results[results.length - 1]?.createdAt,
      errorMessage: executionSummary?.error || null,
      functions: functionResults.map(r => ({
        name: r.functionName,
        status: r.status,
        duration: r.duration,
        error: r.error,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
