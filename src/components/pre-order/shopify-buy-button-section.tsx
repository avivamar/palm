'use client';

import { useEffect, useState } from 'react';

export function ShopifyBuyButtonSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    // 添加自定义样式来美化颜色选择器
    const customStyles = `
      <style>
        /* 隐藏重复的产品组件 */
        .shopify-buy__product:not(:first-child) {
          display: none !important;
        }
        
        .shopify-buy-frame {
          min-height: 400px;
        }
        
        /* 颜色选择器美化 - 参考 pricing-section 设计 */
        .shopify-buy__option-select {
          display: none !important;
        }
        
        .shopify-buy__option {
          position: relative !important;
        }
        
        /* 创建自定义颜色选择器 */
        .shopify-buy__option::after {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          padding: 10px !important;
        }
        
        /* 为不同颜色创建圆形按钮 */
        .shopify-buy__option[data-element-id*="Honey"]::before {
          content: '' !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
          border: 2px solid #e5e7eb !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: inline-block !important;
          margin-right: 8px !important;
        }
        
        .shopify-buy__option[data-element-id*="Honey"]:hover::before {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          transform: scale(1.05) !important;
        }
        
        .shopify-buy__option[data-element-id*="Blue"]::before {
          content: '' !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          border: 2px solid #e5e7eb !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: inline-block !important;
          margin-right: 8px !important;
        }
        
        .shopify-buy__option[data-element-id*="Blue"]:hover::before {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          transform: scale(1.05) !important;
        }
        
        .shopify-buy__option[data-element-id*="Pink"]::before {
          content: '' !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #ec4899, #be185d) !important;
          border: 2px solid #e5e7eb !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: inline-block !important;
          margin-right: 8px !important;
        }
        
        .shopify-buy__option[data-element-id*="Pink"]:hover::before {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          transform: scale(1.05) !important;
        }
        
        /* 选中状态 */
        .shopify-buy__option.shopify-buy__option--selected::before {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
          transform: scale(1.1) !important;
        }
        
        /* 美化颜色选择器容器 */
        .shopify-buy__product__variant-selectors {
          margin: 20px 0 !important;
        }
        
        .shopify-buy__option {
          margin-bottom: 16px !important;
        }
        
        .shopify-buy__option-select-wrapper {
          position: relative !important;
        }
        
        /* 自定义下拉箭头 */
        .shopify-buy__option-select-wrapper::after {
          content: '▼' !important;
          position: absolute !important;
          right: 12px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          pointer-events: none !important;
          color: #6b7280 !important;
          font-size: 12px !important;
        }
        
        /* 基础产品样式 */
        .shopify-buy__product {
          max-width: 400px !important;
          margin: 0 auto !important;
        }
        
        /* 购买按钮样式 */
        .shopify-buy__btn {
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
        }
      </style>
    `;

    // 将样式添加到 head
    const styleElement = document.createElement('div');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement.firstElementChild!);

    // Shopify Buy Button 脚本
    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';

    function loadScript() {
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptURL;
      const head = document.getElementsByTagName('head')[0];
      const body = document.getElementsByTagName('body')[0];
      const target = head || body;
      if (target) {
        target.appendChild(script);
      }
      script.onload = ShopifyBuyInit;
    }

    function ShopifyBuyInit() {
      if (window.ShopifyBuy) {
        const client = window.ShopifyBuy.buildClient({
          domain: '112b9f-2c.myshopify.com',
          storefrontAccessToken: '2322a3f329c037269972624932664616',
        });

        window.ShopifyBuy.UI.onReady(client).then((ui: any) => {
          ui.createComponent('product', {
            id: '9892138877249',
            node: document.getElementById('product-component-1750558499592'),
            moneyFormat: '%24%7B%7Bamount%7D%7D',
            options: {
              product: {
                styles: {
                  product: {
                    '@media (min-width: 601px)': {
                      'max-width': 'calc(25% - 20px)',
                      'margin-left': '20px',
                      'margin-bottom': '50px',
                    },
                    'carousel-button': {
                      display: 'none',
                    },
                  },
                  button: {
                    'font-family': 'Avant Garde, sans-serif',
                    'color': '#000000',
                    ':hover': {
                      'color': '#000000',
                      'background-color': '#d4e672',
                    },
                    'background-color': '#ebff7f',
                    ':focus': {
                      'background-color': '#d4e672',
                    },
                    'border-radius': '17px',
                    'padding-left': '68px',
                    'padding-right': '68px',
                  },
                },
                contents: {
                  img: false,
                  imgWithCarousel: true,
                },
                width: '380px',
                text: {
                  button: 'Pre-order Now',
                },
              },
              productSet: {
                styles: {
                  products: {
                    '@media (min-width: 601px)': {
                      'margin-left': '-20px',
                    },
                  },
                },
              },
              modalProduct: {
                contents: {
                  img: false,
                  imgWithCarousel: true,
                  button: false,
                  buttonWithQuantity: true,
                },
                styles: {
                  product: {
                    '@media (min-width: 601px)': {
                      'max-width': '100%',
                      'margin-left': '0px',
                      'margin-bottom': '0px',
                    },
                  },
                  button: {
                    'font-family': 'Avant Garde, sans-serif',
                    'color': '#000000',
                    ':hover': {
                      'color': '#000000',
                      'background-color': '#d4e672',
                    },
                    'background-color': '#ebff7f',
                    ':focus': {
                      'background-color': '#d4e672',
                    },
                    'border-radius': '17px',
                    'padding-left': '68px',
                    'padding-right': '68px',
                  },
                },
                text: {
                  button: 'Add to cart',
                },
              },
              option: {},
              cart: {
                styles: {
                  button: {
                    'font-family': 'Avant Garde, sans-serif',
                    'color': '#000000',
                    ':hover': {
                      'color': '#000000',
                      'background-color': '#d4e672',
                    },
                    'background-color': '#ebff7f',
                    ':focus': {
                      'background-color': '#d4e672',
                    },
                    'border-radius': '17px',
                  },
                },
                text: {
                  total: 'Subtotal',
                  button: 'Checkout',
                },
                contents: {
                  note: true,
                },
              },
              toggle: {
                styles: {
                  toggle: {
                    'font-family': 'Avant Garde, sans-serif',
                    'background-color': '#ebff7f',
                    ':hover': {
                      'background-color': '#d4e672',
                    },
                    ':focus': {
                      'background-color': '#d4e672',
                    },
                  },
                  count: {
                    'color': '#000000',
                    ':hover': {
                      color: '#000000',
                    },
                  },
                  iconPath: {
                    fill: '#000000',
                  },
                },
              },
            },
          });
        });
      }
    }

    if (window.ShopifyBuy) {
      if (window.ShopifyBuy.UI) {
        ShopifyBuyInit();
      } else {
        loadScript();
      }
    } else {
      loadScript();
    }
  }, [isClient]);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto text-center">
        {/* 标题区域 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {/* 使用硬编码占位符，开发完后需要检查多语言部分 */}
            Shopify Pre-order
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {/* 使用硬编码占位符，开发完后需要检查多语言部分 */}
            Order directly through our Shopify store with secure checkout
          </p>
        </div>

        {/* Shopify 产品组件容器 */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            {isClient
              ? (
                  <div id="product-component-1750558499592" className="shopify-buy-frame"></div>
                )
              : (
                  <div className="shopify-buy-frame min-h-[400px] flex items-center justify-center">
                    <div className="text-gray-500 dark:text-gray-400">Loading product...</div>
                  </div>
                )}
          </div>
        </div>

        {/* 信任标识 */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Money Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Fast Shipping</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// 扩展 Window 接口以包含 ShopifyBuy
declare global {
  interface Window {
    ShopifyBuy: any;
  }
}
