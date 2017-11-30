$(document).ready(function () {
  updatePages(window.location.hash.slice(1))

  $(window).on('hashchange', function(){
    var hash = location.hash.slice(1)
    updatePages(hash)
  });

  function updatePages(hash) {
    if(hash === 'pay' || hash === 'transfer') {
      $('.page-1').hide()
      $('.page-2').show()
    } else {
      $('.page-1').show()
      $('.page-2').hide()
    }
  }

  $('#donate-btn').click(e => {
    e.preventDefault()
    window.location.hash = '#pay'
  })

  $('#transfer-btn').click(e => {
    e.preventDefault()
    window.location.hash = '#transfer'
  })

})
