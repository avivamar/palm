// 关键 CSS 内联组件 - 只包含首屏必需的样式
export function CriticalCSS() {
  return (
    <style jsx>
      {`
      /* 基础重置和布局 */
      * {
        box-sizing: border-box;
      }
      
      html {
        scroll-behavior: smooth;
      }
      
      body {
        margin: 0;
        padding: 0;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Hero 区域关键样式 */
      .hero-section {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .hero-background {
        position: absolute;
        inset: 0;
        z-index: 0;
      }
      
      .hero-content {
        position: relative;
        z-index: 10;
        text-align: center;
        color: white;
        max-width: 80rem;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      .hero-title {
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: 700;
        line-height: 1.1;
        margin-bottom: 1.5rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }
      
      .hero-description {
        font-size: clamp(1rem, 2.5vw, 1.25rem);
        margin-bottom: 2.5rem;
        opacity: 0.9;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }
      
      /* 按钮基础样式 */
      .cta-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1rem 2rem;
        font-size: 1.125rem;
        font-weight: 600;
        text-decoration: none;
        border-radius: 0.5rem;
        transition: transform 0.2s ease;
        min-width: 220px;
      }
      
      .cta-button:hover {
        transform: translateY(-1px);
      }
      
      /* 加载状态 */
      .loading-placeholder {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      
      /* 响应式优化 */
      @media (max-width: 768px) {
        .hero-content {
          padding: 0 1.5rem;
        }
        
        .hero-title {
          font-size: 2.5rem;
        }
        
        .hero-description {
          font-size: 1rem;
        }
        
        .cta-button {
          min-width: 200px;
          padding: 0.875rem 1.5rem;
        }
      }
      
      /* 防止 FOUC */
      .fade-in {
        animation: fadeIn 0.5s ease-in;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `}
    </style>
  );
}
