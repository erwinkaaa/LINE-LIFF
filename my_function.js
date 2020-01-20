$(document).ready(function() { 

	var loc = window.location.pathname;
	var dir = loc.substring(loc.lastIndexOf('/')+1);

	var type = ""
	var favorite = false

	if (dir.includes("index")) {
		type = "movie";
	} else if (dir.includes("tv")) {
		type = "tv";
	} 
	if (dir.includes('fav')) {
		favorite = true;
		if (dir.includes("movie")) {
			type = "movie";
		} else if (dir.includes("tv")) {
			type = "tv";
		} 
	}

	if (!favorite) {
		load(type);

		$("#seemore").click(function() {
			counter++;
			load(type);
		});
	} else {
		loadFav(type);
	}

	$('#scrolltotop').fadeOut();
	$(document).scroll(function() {
		var y = $(this).scrollTop();
		if (y > 800) {
			$('#scrolltotop').fadeIn();
		} else {
			$('#scrolltotop').fadeOut();
		}
	});

	$("#scrolltotop").click(function() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});
});

var counter = 1;

function load(type) {
	$.get("https://api.themoviedb.org/3/discover/"+type+"?api_key=11a80a36b6fe99bfe6fe1322d3cc95b5&page="+counter, function(data, status) {
		if (status == "success") {
			$("#seemore").removeAttr('hidden');
			var results = data.results;
			for (var i = 0; i < results.length; i++) {
				var img = "https://image.tmdb.org/t/p/original"+results[i].poster_path;
				var html = '<div class="col-lg-3 col-md-6 mb-4 flexitem" id="media">' +
				'<div class="card">' +
				'<img src="'+img+'" class="card-img-top" alt="...">' +
				'<div class="card-body">';
				var title = "";
				if (type == "movie") {
					title = results[i].title;
					html += '<h5 class="card-title">'+ results[i].title +'</h5>';
				} else if (type == "tv") {
					title = results[i].name;
					html += '<h5 class="card-title">'+ results[i].name +'</h5>';
				}
				html += '<p class="card-text">'+ results[i].overview +'</p>' +
				'<button class="btn btn-primary float-right" onclick="fav('+results[i].id+');" id="fav'+results[i].id+'"'+
				'data-id="'+results[i].id+'" data-title="'+title+'" data-overview="'+results[i].overview+'" data-type="'+type+'" data-img="'+img+'">Add To Favorite</button>' +
				'</div>' +
				'</div>' +
				'</div>';
				$("#inflate_here").append(html);
			}
		}
	});
}

function loadFav(type) {
	list = JSON.parse(localStorage.getItem('list'));
	$("#inflate_here").empty();
	for (i in list) {
		if (list[i].type == type) {
			var html = '<div class="col-lg-3 col-md-6 mb-4 flexitem" id="media">' +
			'<div class="card">' +
			'<img src="'+list[i].img+'" class="card-img-top" alt="...">' +
			'<div class="card-body">'+
			'<h5 class="card-title">'+ list[i].title +'</h5>' +
			'<p class="card-text">'+ list[i].overview +'</p>' +
			'<button class="btn btn-danger float-right" onclick="removefav('+list[i].id+');"">Remove From Favorite</button>' +
			'</div>' +
			'</div>' +
			'</div>';
			$("#inflate_here").append(html);
		}
	}
}

function fav(id) {
	var title = $("#fav"+id).data('title');
	var overview = $("#fav"+id).data('overview');
	var type = $("#fav"+id).data('type');
	var img = $("#fav"+id).data('img');

	if (localStorage.list) {
		list = JSON.parse(localStorage.getItem('list'));
	}
	else {
		list = [];
	}

	var exist = false;
	for (i in list) {
		if (list[i].id == id) {
			exist = true;
		}
	}

	if (!exist) {
		list.push({ 'id': id, 'title': title, 'overview': overview, 'type': type, 'img': img });
		localStorage.setItem('list', JSON.stringify(list));

		if (!liff.isInClient()) {
			alert('Data stored');
			sendAlertIfNotInClient();
		} else {
			liff.sendMessages([{
				'type': 'image',
				"originalContentUrl": img,
				"previewImageUrl": img
			},{
				'type': 'text',
				'text': title+" has been added to your favorite"
			}]).then(function() {
				alert('Data stored');
			}).catch(function(error) {
				alert('Error occured');
			});
		}
	} else {
		alert('Data exist');
	}
}

function removefav(id) {
	if (localStorage.list) {
		list = JSON.parse(localStorage.getItem('list'));

		var title = "";
		var idx = 0;
		for (i in list) {
			if (list[i].id == id) {
				title = list[i].title;
				list.splice(idx, 1);
			}
			idx++;
		}

		localStorage.setItem('list', JSON.stringify(list));

		var loc = window.location.pathname;
		var dir = loc.substring(loc.lastIndexOf('/')+1);
		var type = "";
		if (dir.includes('fav')) {
			favorite = true;
			if (dir.includes("movie")) {
				type = "movie";
			} else if (dir.includes("tv")) {
				type = "tv";
			} 
		}
		loadFav(type);

		if (!liff.isInClient()) {
			alert('Data removed');
			sendAlertIfNotInClient();
		} else {
			liff.sendMessages([{
				'type': 'text',
				'text': title+" has been removed from your favorite"
			}]).then(function() {
				alert('Data removed');
			}).catch(function(error) {
				alert('Error occured');
			});
		}
	}
}