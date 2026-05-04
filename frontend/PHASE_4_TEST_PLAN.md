# Phase 4 Frontend Testing Plan

## Goal
Cover analytics and grading pages with strong unit/integration tests, then finalize with system, performance, stress, and security testing.

## Scope for Phase 4
- `AssessmentAnalytics.jsx`
- `AssessmentGrading.jsx`
- `GradingContext.jsx`
- shared UI behavior for `ThemedSelect.jsx`
- API mocking via MSW

## Priority tests
1. Analytics page
   - course dropdown loads and defaults to All Courses
   - CLO chart and score summary render after API success
   - error state displays when analytics API fails
   - course selection triggers a course-specific analytics request
2. Grading page
   - form validation for missing course, missing files, and ZIP path
   - upload UI accepts file input and displays results
   - grading request uses the expected API endpoint
   - success response renders result details and download actions
   - reset button returns user to the upload form
3. Shared UI
   - `ThemedSelect` opens menu and selects options reliably

## Implementation plan
- Add MSW setup under `src/test/` for mocked API routes
- Add page tests under `src/pages/__tests__/`
- Add component tests under `src/components/__tests__/`
- Keep test data minimal but realistic
- Use `MemoryRouter` for React Router context

## Testing execution order
1. Run unit tests for `AssessmentAnalytics` and `ThemedSelect`
2. Run integration tests for `AssessmentGrading`
3. Confirm MSW intercepts expected API calls
4. Review coverage for analytics/grading logic and shared form state

## Post-Phase 4 plan
### System testing
- Run full UI flows using Playwright/Cypress against a deployed frontend + mocked backend
- Verify login, course dashboard, analytics, and grading behavior end to end
- Validate role-specific page access and navigation

### Performance testing
- Measure page load and render times for analytics/grading pages
- Test chart and table rendering performance with realistic dataset sizes
- Run Lighthouse or browser performance audits for frontend responsiveness

### Stress testing
- Simulate heavy use of the analytics page with repeated filter changes
- Test grading file upload under concurrent requests / large upload payloads
- Validate app stability when API responses are slow or fail intermittently

### Security testing
- Verify token and auth flows do not leak sensitive data
- Test route guard behavior for protected pages
- Confirm no insecure API URLs or unsafe input handling in forms
- Run a lightweight dependency security scan for the frontend stack
