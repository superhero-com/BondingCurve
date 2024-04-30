/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

const assert = require('chai').assert

require('it-each')({testPerIteration: true});
const BONDING_CURVE_LINEAR_CONTRACT = './contracts/BondCurveLinear.aes';
const testData = require('./data');
const {utils, wallets} = require("@aeternity/aeproject");

describe('Bonding Curve Contract', () => {
  let aeSdk, contract;

  before(async () => {
    aeSdk = utils.getSdk();
  });

  it('Deploying Bond Contract', async () => {
    contract = await aeSdk.initializeContract({
      sourceCode: utils.getContractContent(BONDING_CURVE_LINEAR_CONTRACT)
    });
    const init = await contract.$deploy([]);
    assert.equal(init.result.returnType, 'ok');
  });

  describe('Buy current price tests', () => {
    it.each(
      [...testData],
      'Should get buy price for supply %s',
      ['element'],
      (p, next) => {
        contract.buy_price(p.totalSupply).then((result) => {
          assert.equal(
            result.decodedResult,
            p.totalSupply + 1,
            `Buy price incorrect for supply: ${p.totalSupply}`,
          );
          next();
        });
      },
    );
  });

  describe('Sell current price tests', () => {
    it.each(
      [...testData],
      'Should get sell price for supply %s',
      ['element'],
      (p, next) => {
        contract.sell_price(p.totalSupply).then((result) => {
          assert.equal(
            result.decodedResult,
            p.totalSupply,
            `Sell price incorrect for supply: ${p.totalSupply}`,
          );
          next();
        });
      },
    );
  });

  describe('Calculate Buy price tests', () => {
    it.each(
      [...testData],
      'Should calculate buy price for supply %s',
      ['element'],
      (p, next) => {
        contract
          .calculate_buy_price(p.totalSupply, p.buy.amount)
          .then((result) => {
            assert.equal(
              result.decodedResult,
              p.buy.aettos,
              `Calculation for buy price incorrect for: supply=${p.totalSupply} buy_amount=${p.buy.amount}`,
            );
            next();
          });
      },
    );
  });

  describe('Sell price tests', () => {
    it.each(
      [...testData],
      'Should calculate sell return for supply %s',
      ['element'],
      (p, next) => {
        if (p.totalSupply >= p.sell.amount) {
          contract
            .calculate_sell_return(p.totalSupply, p.sell.amount)
            .then((result) => {
              assert.equal(
                result.decodedResult,
                p.sell.aettos,
                `Calculation for sell price incorrect for: supply=${p.totalSupply} sell_amount=${p.sell.amount}`,
              );
              next();
            });
        } else {
          contract
            .calculate_sell_return(p.totalSupply, p.sell.amount)
            .then((result) => {
              assert.equal(
                result.decodedResult,
                p.sell.aettos,
                `Calculation for sell price incorrect for: supply=${p.totalSupply} sell_amount=${p.sell.amount}`,
              );
              next();
            })
            .catch((e) => {
              if (
                e.decodedError.indexOf(
                  'ERROR_SELL_INSUFFICIENT_TOTAL_SUPPLY' > -1,
                )
              ) {
                next();
              }
            });
        }
      },
    );
  });
});
