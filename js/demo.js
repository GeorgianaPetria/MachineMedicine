// The URL to your endpoint that maps to s3Credentials function
var credentialsUrl = 'http://localhost:5000/s3_credentials';

$('.upload-btn').on('click', function (){
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
});

$('#upload-input').on('change', function(){
  $('#require-selection').text("");
});

$('#uploadVideo').submit(function(){

  var files = $('#upload-input').get(0).files;
  if (files.length > 0) {
    var formElement = document.getElementById('uploadVideo');
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData(formElement);

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }

    var file = files[0];
    var filename = file.name;
    var contentType = file.type;

    $.ajax({
      url: credentialsUrl,
      type: 'GET',
      dataType: 'json',
      data: {
        filename: filename,
        content_type: contentType
      },
      success: function(s3Data) {
        var data = new FormData();

        Object.keys(s3Data.params).forEach(function(key, idx) {
          console.log(key, idx, s3Data.params[key]);
          data.append(key, s3Data.params[key]);
        });
        data.append('file', file, filename);

        var url = s3Data.endpoint_url;

        $.ajax({
          url: url,
          type: 'POST',
          data: data,
          processData: false,
          contentType: false,
          success: function(data){
              console.log('upload successful!\n' + data);
          },
          xhr: function() {
            // create an XMLHttpRequest
            var xhr = new XMLHttpRequest();

            // listen to the 'progress' event
            xhr.upload.addEventListener('progress', function(evt) {

              if (evt.lengthComputable) {
                // calculate the percentage of upload completed
                var percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);

                // update the Bootstrap progress bar with the new percentage
                $('.progress-bar').text(percentComplete + '%');
                $('.progress-bar').width(percentComplete + '%');

                // once the upload reaches 100%, set the progress bar text to done
                if (percentComplete === 100) {
                  $('.progress-bar').html('Done');
                }
              }

            }, false);

            return xhr;
          }
        });
      }
    });

  } else {
    $('#require-selection').text("Please choose a video.");
  }
  return false;
});