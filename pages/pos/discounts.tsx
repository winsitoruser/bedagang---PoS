import { GetServerSideProps } from 'next';

// Redirect /pos/discounts to /pos/promo
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/pos/promo',
      permanent: true,
    },
  };
};

const DiscountsPage = () => {
  // This component won't render on the client since we're redirecting on the server
  return null;
};

export default DiscountsPage;
