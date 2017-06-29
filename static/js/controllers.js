$('#buttonId').click(function() {    
    $.ajax({
        url: your_url,
        method: 'POST', // or another (GET), whatever you need
        data: {
            name: value, // data you need to pass to your function
            click: True
        }
        success: function (data) {        
            // success callback
            // you can process data returned by function from views.py
        }
    });
});