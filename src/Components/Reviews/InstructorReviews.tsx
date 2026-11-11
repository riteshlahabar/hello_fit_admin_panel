// Instructor Reviews (PDF 6.10) — the provider's review of a customer.
//
// **Internal.** The customer never sees these, and they carry a confidential
// note that is admin-only. Nothing here is published to a customer-facing
// surface; moderating one affects the customer's trust record, not a public
// profile.

import ReviewsPage from './ReviewsPage';

const InstructorReviews = () => (
  <ReviewsPage title='Instructor Reviews' direction='INSTRUCTOR_TO_CUSTOMER' />
);

export default InstructorReviews;
