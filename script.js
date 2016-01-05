var api_key = "XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8";
var host_name = ""
var get_amount = 20;
var photo_count = 0;
var loading = false;

function loadUser() {
    host_name = $("#text-username").val();
    photo_count = 0;
    $("#tile-container").empty();
    getPhotos();
    return false;
}

function getPhotos() {
    if (!loading) {
        loading = true;
        $("#spinner").show();
        $.ajax({
            type: "GET",
            url: "https://api.tumblr.com/v2/blog/" + host_name + ".tumblr.com/likes?api_key=" + api_key,
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

                            // Construct image
                            var image = new Image();
                            image.src = v2.original_size.url;;
                            image.onload = function() {
                                // Scale with respect to the larger dimension
                                if (this.width < this.height) {
                                    this.style.width = "100%";
                                    this.style.height = "auto";
                                }
                                else {
                                    this.style.width = "auto";
                                    this.style.height = "100%";
                                }
                            }

                            var list_item = $("<li>");
                            list_item.addClass("tile")
                            list_item.click(function() {
				$("#viewer-image").attr("src", image.src);
				$("#viewer").show();
			    });
			    list_item.append(image)
			    $("#tile-container").append(list_item);
			});
		    }
                });
	    }
        });
    }
}

$("#form-username").submit(function() {
    loadUser();
    return false;
});

$("#viewer").click(function() {
    $(this).hide();
});

$(window).scroll(function () {
    if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
        return getPhotos();
    }
});

$(document).ajaxStop(function () {
    loading = false;
    $("spinner").hide();
});
