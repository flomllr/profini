import styled from 'styled-components';
import { NFT } from '../types';
import { Card } from './Card';

export const CardGrid: React.FC<{ nfts: NFT[] }> = ({ nfts }) => {
  return (
    <Container>
      {nfts.map(nft => (
        <Card nft={nft} />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-auto-flow: columns;
  grid-gap: 60px 20px;
`;
