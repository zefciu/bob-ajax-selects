
(function($) {

function _renderItemHTML(ul, item) {
    return $("<li></li>")
        .data("item.autocomplete", item)
        .append("<a>" + item.label + "</a>")
        .appendTo(ul);
}

$.fn.autocompletehtml = function() {
    this.data("autocomplete")._renderItem = _renderItemHTML;
    return this;
}

$.fn.autocompleteselect = function(options) {
    return this.each(function() {
        var id = this.id

        var $this = $(this)
        var $text = $("#"+id+"_text")
        var $deck = $("#"+id+"_on_deck")

        function receiveResult(event, ui) {
            if ($this.val()) {
                kill();
            }
            $this.val(ui.item.pk);
            $text.val('');
            addKiller(ui.item);
            $deck.trigger("added");

            return false;
        }

        function addKiller(item) {
            killer_id = "kill_" + id;
            killButton = '<span class="iconic" id="'+killer_id+'">X</span> ';
            $deck.empty();
            $deck.append("<div>" + killButton + item.desc + "</div>");

            $("#"+killer_id).click(function() {
                kill();
                $deck.trigger("killed");
            });
        }

        function kill() {
            $this.val('');
            $deck.children().fadeOut(1.0).remove();
        }

        options.select = receiveResult;
        $text.autocomplete(options);

        if ($this.val()) { // add X for initial value if any
            addKiller({ pk: $this.val(), desc: $deck.children().html() });
        }

        $this.bind('didAddPopup', function(event, pk, repr) {
            ui = { item: { pk: pk, desc: repr } };
            receiveResult(null, ui);
        });
    });
};

$.fn.autocompleteselectmultiple = function(options) {
    return this.each(function() {
        var id = this.id

        var $this = $(this)
        var $text = $("#"+id+"_text")
        var $deck = $("#"+id+"_on_deck")

        function receiveResult(event, ui) {
            pk = ui.item.pk;
            prev = $this.val();

            if (prev.indexOf("|"+pk+"|") == -1) {
                $this.val((prev ? prev : "|") + pk + "|");
                addKiller(ui.item);
                $text.val('');
                $deck.trigger("added");
            }

            return false;
        }

        function addKiller(item) {
            var pk = item.pk;

            killer_id = "kill_" + pk + id;
            killButton = '<span class="iconic" id="'+killer_id+'">X</span> ';
            $deck.append('<div id="'+id+'_on_deck_'+pk+'">' + killButton + item.desc + ' </div>');

            $("#"+killer_id).click(function() {
                kill(pk);
                $deck.trigger("killed");
            });
        }

        function kill(pk) {
            $this.val($this.val().replace("|" + pk + "|", "|"));
            $("#"+id+"_on_deck_"+pk).fadeOut().remove();
        }

        options.select = receiveResult;
        $text.autocomplete(options);

        if (options.initial) {
            $.each(options.initial, function(i, item) {
                addKiller(item);
            });
        }

        $this.bind('didAddPopup', function(event, pk, repr) {
            ui = { item: { pk: pk, desc: repr } };
            receiveResult(null, ui);
        });
    });
};

})(jQuery);


function dynamicAddAutocomplete(prefix_id, callback/*(html_id)*/) {
    var prefix = 0;
    var html_id = prefix_id;

    // Some dirty loop to find the appropriate element to apply the callback to
    while ($('#'+html_id).length) {
        html_id = prefix_id.replace(/__prefix__/, prefix++);
    }
    html_id = prefix_id.replace(/__prefix__/, prefix-2);

    // Ignore the first call to this function, the one that is triggered when
    // page is loaded just because the "empty" form is there.
    if ($("#"+html_id+", #"+html_id+"_text").hasClass("ui-autocomplete-input"))
        return;

    callback(html_id);
}

/* requires RelatedObjects.js */

function didAddPopup(win,newId,newRepr) {
    var name = windowname_to_id(win.name);
    $("#"+name).trigger('didAddPopup',[html_unescape(newId),html_unescape(newRepr)]);
    win.close();
}
