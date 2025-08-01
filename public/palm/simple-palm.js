// 极简的Palm客户端逻辑
(function() {
  // 从localStorage获取数据
  function getData() {
    try {
      return JSON.parse(localStorage.getItem('palm-data') || '{}')
    } catch (e) {
      return {}
    }
  }
  
  // 保存数据到localStorage
  function saveData(key, value) {
    const data = getData()
    data[key] = value
    localStorage.setItem('palm-data', JSON.stringify(data))
  }
  
  // 处理按钮点击
  function handleButtonClick(button) {
    const value = button.getAttribute('data-value')
    const field = button.getAttribute('data-field')
    const nextStep = button.getAttribute('data-next')
    
    if (field && value) {
      saveData(field, value)
    }
    
    if (nextStep) {
      const locale = window.location.pathname.split('/')[1]
      window.location.href = `/${locale}/palm/simple/${nextStep}`
    }
  }
  
  // 初始化
  document.addEventListener('DOMContentLoaded', function() {
    // 绑定所有带有data-action的按钮
    const buttons = document.querySelectorAll('[data-action="next"]')
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault()
        handleButtonClick(button)
      })
    })
    
    // 处理表单提交
    const forms = document.querySelectorAll('form[data-palm-form]')
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault()
        const formData = new FormData(form)
        formData.forEach((value, key) => {
          saveData(key, value)
        })
        
        const nextStep = form.getAttribute('data-next')
        if (nextStep) {
          const locale = window.location.pathname.split('/')[1]
          window.location.href = `/${locale}/palm/simple/${nextStep}`
        }
      })
    })
  })
})();