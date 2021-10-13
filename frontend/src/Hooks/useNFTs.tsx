import axios from 'axios';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { CONFIG } from '../config';
import { NFT } from '../types';

export function useNFTs(): NFT[] {
  const [fetches, setFetches] = useState(0);
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    (async () => {
      const newNfts: NFT[] = [];
      const tokenAddress = CONFIG.TOKEN_ADDRESS;
      // TODO: type
      let assetsObjects: any;
      try {
        assetsObjects = await axios.get(
          `https://api.opensea.io/api/v1/assets?order_direction=desc&offset=0&limit=50&asset_contract_address=${tokenAddress}`
        );
        assetsObjects = assetsObjects.data;
      } catch (e) {
        console.log('retrying', e);
        setTimeout(() => {
          setFetches(current => current + 1);
        }, 1500);
        setNfts([]);
      }
      console.log('Asset objects', assetsObjects);
      assetsObjects.assets.reverse().forEach(async (asset: any) => {
        if (!asset.image_original_url) {
          setNfts([]);
        }
        let price = '';
        let sold = false;
        console.log('Assets', asset);
        if (asset.sell_orders) {
          if (asset.sell_orders[0]) {
            //price = web3.utils.fromWei(`${new Bignumber(asset.sell_orders[0].base_price).toNumber()}`, 'ether');
            console.log('Baseprice', asset.sell_orders[0].base_price);
            price = BigNumber.from(asset.sell_orders[0].base_price).toString();
          } else {
            price = '0';
            sold = true;
          }
        } else {
          price = '0';
          sold = true;
        }
        let owner;
        let soldFor: string | undefined;
        if (asset.owner.user) {
          if (asset.owner.user.username) {
            owner = asset.owner.user.username;
          }
        }
        if (asset.last_sale) {
          soldFor = BigNumber.from(asset.last_sale.total_price).toString();
        }
        if (!owner) {
          owner = asset.owner.address;
        }
        if (owner === 'BurnAddress') {
          setNfts([]);
        }

        let creator;
        if (asset.creator.user) {
          if (asset.creator.user.username) {
            creator = asset.creator.user.username;
          }
        }
        if (!creator) {
          creator = asset.creator.address;
        }
        const buyOrder = asset.sell_orders && asset.sell_orders[0];
        console.log('buy order', buyOrder);

        newNfts.push({
          name: asset.name,
          imageUrlOriginal: asset.image_original_url,
          tokenId: asset.token_id,
          description: asset.description,
          owner,
          creator,
          price,
          buyOrder,
          sold,
          soldFor,
          raw: asset
        });
      });
      console.log('new nfts', newNfts);
      setNfts(newNfts);
    })();
  }, [fetches]);

  return nfts;
}
