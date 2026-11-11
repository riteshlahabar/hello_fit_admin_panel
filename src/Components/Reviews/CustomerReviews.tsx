// Customer Reviews (PDF 6.10) — the customer's review of a provider.
//
// Public once published: approving or hiding one changes what customers see on
// the provider's profile. The internal direction lives in InstructorReviews.

import ReviewsPage from './ReviewsPage';

const CustomerReviews = () => (
  <ReviewsPage title='Customer Reviews' direction='CUSTOMER_TO_INSTRUCTOR' />
);

export default CustomerReviews;
