$(document).ready(function() {
    var s = window.location.search;
    if (s.length === 0) {
        core.alert("Error loading build data", "No build id specified")
    }
    else {
        $.each(s.slice(1).split("&"), function() {
            if (this.split("=")[0] === "id")
            	build.loadFile(this.split("=")[1]);
        });
        $(".tab-bar-item").click(function() {
            build.showpage($(this).text());
        });
        build.showpage(window.location.hash.slice(1).toLowerCase());
    }
});
var build = {
	showpage: function(page) {
	    $(".selected").removeClass("selected");
	    $(".build-content .visible").removeClass("visible");
	    var e = $(".tab-bar-item:contains(" + page.capitalize() + ")");
	    if (e.length === 1) {
	        e.addClass("selected");
	        $(".build-content ." + page.toLowerCase()).addClass("visible");
	        window.location.hash = page.toLowerCase();
	    }
	    else {
	        $(".tab-bar-item:contains(General)").addClass("selected");
	        $(".build-content .general").addClass("visible");
	    }
	},
	loadURL: function(url) {
		$.ajax({
	        url: url,
	        success: function(r) {
	            build.loadData(r);
	        },
	        error: function(jqXHR, exception) {
	            var msg = '';
	            if (jqXHR.status === 0) {
	                msg = 'Not connect.\n Verify Network.';
	            }
	            else if (jqXHR.status == 404) {
	                msg = 'Requested page not found. [404]';
	            }
	            else if (jqXHR.status == 500) {
	                msg = 'Internal Server Error [500].';
	            }
				else if (exception === 'parsererror') {
	                msg = 'Requested JSON parse failed.';
	            }
				else if (exception === 'timeout') {
	                msg = 'Time out error.';
	            }
				else if (exception === 'abort') {
	                msg = 'Ajax request aborted.';
	            }
				else {
					msg = 'Uncaught Error.\n' + jqXHR.responseText;
	            }
				core.alert("Error loading build data", msg);
	        }
	    });
	},
	loadFile: function(file) {
		build.loadURL("/builds/" + file + ".json")
	},
	loadData: function(d) {
	    document.title = d.title + " - " + document.title;
	    $("meta[name=description]").attr("content", d.title + " by " + d.author);
	    $(".build-header .title").text(d.title);
	    $(".build-header .author").text(d.author);
	    if (d.hasOwnProperty("link")) {
	        $(".build-header .info a").attr("href", d.link);
	        $(".build-header .info a").attr("target", "_blank");
	    }
	    if (d.hasOwnProperty("patch"))
	        $(".build-header .date").before(" for Patch " + d.patch);
	    if (d.hasOwnProperty("date"))
	        $(".build-header .date").text("Last updated: " + d.date);
	    $(".tab-bar-item").each(function() {
	    	var e = $(this),
	    		t = e.text().toLowerCase();
	    	if (!d.build.hasOwnProperty(t)) {
	    		e.remove();
	    		$("." + t).remove();
	    	}
	    });
	    $.each(d.build, function(key, value) {
	        var p = key;
	        if (p === "general")
	        	$(".general .main-container").html("<p>" + value.join("</p><p>") + "</p>");
	        else if (p === "weapons") {
            	$.each(this, function(key, value) {
            		var k = key;
            		var s = '<div class="' + k + '"><div class="icon weapon ' + value.icon + '"></div><div class="info"><div class="name">' + value.name + '</div><div class="talents text">' + value.talents.join(", ") + '</div></div><div class="talent-icons"></div></div>';
            		if (value.hasOwnProperty("mods"))
						s += '<div class="' + k + ' mods"></div>';
            		$(".build-content .weapons").append(s);
            		$.each(value.talents, function(i) {
            			$(".build-content ." + k + " .talent-icons").append('<div class="icon weapon-talent ' + this.classify() + '"></div>');
                    });
					if (value.hasOwnProperty("mods")) {
	                    $.each(value.mods, function(key, value) {
	                    	$(".build-content .weapons .mods." + k).append("<div class='" + key + "'><div class='icon'></div><div class='rolls'></div></div>");
	                    	$.each(this, function(i) {
	                    		$(".build-content .weapons ." + k + " ." + key + " .rolls").append("<span>" + this + "</span>");
	                    	});
	                    });
                	}
            	});
            }
	        else {
		        $.each(this, function(key) {
		            var k = key;
		            if (k === "items") {
		                $.each(this, function(key, value) {
		                    var t = key;
		                    $.each(this, function(key, value) {
		                        if (key === "icon")
		                            $(".build-content .gear .items ." + t + "> .icon").addClass(value);
		                        else if ($.isArray(value))
		                        	$(".build-content .items ." + t + " ." + key).text(value.join(", "));
		                        else
		                            $(".build-content .gear .items ." + t + " ." + key).text(value);
		                    });
		                });
		            }
		            else if (k === "stats") {
		                $.each(this, function(key, value) {
		                	var t = key;
		                    $.each(this, function(i) {
		                        if (t === "main-stats")
		                        	v = this[1];
		                        else if (t === "main-rolls")
		                        	v = this[1] + " Roll";
		                        else
		                        	v = this[1] + " Mod";
		                        if (t === "mods" && typeof this[2] != "undefined")
		                        	a = this[2];
		                        else
		                        	a = "";
		                        if (t === "performance")
		                        	i = this[2];
		                        else
		                        	i = this[1].classify();
		                        $(".build-content .gear .stats").append('<div class="' + t + '"><div class="amount">' + this[0] + '</div><div class="icon ' + i + '"></div><div class="info"><div class="name">' + v + '</div>' + a + '</div></div>');
		                    });
		                });
		            }
		            else {
		                $.each(this, function(key, value) {
		                    if (key === "icon")
		                        $(".build-content ." + p + " ." + k + "> .icon").addClass(value);
		                    else if (key === "mod") {
		                    	$(".build-content ." + p + " ." + k + " .mod").text(value);
		                    	$(".build-content ." + p + " ." + k + " .icon").addClass(value.classify());
		                    }
		                    else
		                        $(".build-content ." + p + " ." + k + " ." + key).text(value);
		                });
		            }
		        });
	  		}
	    });
		$.ajax({
	        url: "/data/weapon_talents.json",
	        success: function(r) {
	        	$(".build-content .talent-icons .icon").each(function() {
	        		var t = $(this).attr("class").split(" ").last();
					$(this).append("<span class='tooltip'><h1>" + t.capitalize() + "</h1>" + r[t] + "</span>");
	        	});
        	}
	    });
	    $.ajax({
	        url: "/data/gear_talents.json",
	        success: function(r) {
	        	$(".build-content .items").children().each(function() {
	        		var e = $(this).find(".icon"),
	        			n = $(this).find(".name").text(),
	        			t = "";
	        		if (e.hasClass("he") || e.hasClass("exotic")) {
	        			if (e.hasClass("he"))
	        				t = n.split(" ")[0];
	        			else if (e.hasClass("exotic")) {
		        			var k = n.split(" ")[0].split("'")[0];
		        			t = n;
		        		}
	        			$(this).append("<span class='tooltip'><h1>" + t.capitalize() + "</h1>" + r[k || t] + "</span>");
	        		}
					
	        	});
        	}
	    });
	    $.ajax({
	        url: "/data/gearsets.json",
	        success: function(r) {
	        	$(".build-content .items").children().each(function() {
		        	var e = $(this).find(".icon");
	        		if (!e.hasClass("he") && !e.hasClass("exotic")) {
	        			var g = e.attr("class").split(" ").last();
	        				t = r[g].name;
	        				b = r[g].bonuses;
	        			$(this).append("<span class='tooltip'><h1>" + t + "</h1></span>");
	        			for (var i = 0; i < b.length; i++) {
	        				$(this).find(".tooltip").append("<p>" + b[i] + "</p>");
	        			}
	        		}
	        	});
        	}
	    });
	    tooltips.follow(true);
	}
};