var api_key = "XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8";
var host_name = "wurflen.tumblr.com";
var get_amount = 20;
var photo_count = 0;

function getPhotos() {
    $.ajax({
        type: "GET",
        url: "https://api.tumblr.com/v2/blog/" + host_name + "/likes?api_key=" + api_key,
        dataType: "jsonp",
        data: {
	    "limit": get_amount,
	    "offset": photo_count
        },
        success: function(results) {
	    photo_count += get_amount;
	    $.each(results.response.liked_posts, function(i, v1) {
                if (typeof v1.photos != 'undefined') {
		    $.each(v1.photos, function(j, v2) {
                        $("#tile-container").append(
			    $("<li>").attr("class", "tile").append(
                                $("<img>").attr("src", v2.original_size.url)
			    )
                        );
		    });
                }
	    });
        }
    });
}

getPhotos();

$(window).scroll(function () {
    if ($(window).scrollTop() >= $(document).height() - $(window).height() - 100) {
	getPhotos();
    }
});
