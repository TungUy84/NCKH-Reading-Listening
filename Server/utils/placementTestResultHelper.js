// Tái sử dụng toàn bộ utilities từ practiceAttemptHelper
const {
  validatePracticeSubmissionPayload,
  scorePracticeSubmission,
  sanitizeDuration,
  parseDateValue
} = require('./practiceAttemptHelper');

// Export lại để sử dụng cho placement test result
module.exports = {
  validatePracticeSubmissionPayload,
  scorePracticeSubmission,
  sanitizeDuration,
  parseDateValue
};
