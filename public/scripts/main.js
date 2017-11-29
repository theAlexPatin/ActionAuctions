var originalValFn = $.fn.val;

$.fn.val = function() {
    var ret = originalValFn.apply( this, arguments );
    if (arguments.length > 0) {
      this.trigger('change')
    }
    return ret;
}

$(document).ready(function () {


  $('#code').keyup(function (event) {
    if(event.target.value === '') {
      $('#join-btn').prop('disabled', true)
    } else {
      $('#join-btn').prop('disabled', false)
    }
  })

  $('.quick-item').click(function () {
    const value = $(this).data('value')
    const active = $(this).hasClass('-active')

    if (!active) {
      $(this).siblings().removeClass('-active')
      $(this).addClass('-active')
      $('#donate-amt').val(value)
    } else {
      $('#donate-amt').val(value)
    }
  })

  $('#donate-amt').keyup(function () {
    $('.quick-item').removeClass('-active')
  })

  $('#donate-amt').on('input change propertychange paste', function () {
    const value = $(this).val()
    console.log(value)
    if (value === '') {
      $('#donate-btn').prop('disabled', true)
      $('#mini-donate').hide()
    } else {
      $('#donate-btn').prop('disabled', false)
      $('#mini-donate').show()
    }
  })
})
