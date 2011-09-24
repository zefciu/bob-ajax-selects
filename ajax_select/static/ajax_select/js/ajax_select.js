
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
            addKiller(ui.item.desc);
            $deck.trigger("added");

            return false;
        }

        function addKiller(repr) {
            killButton = '<span class="iconic" id="kill_'+id+'">X</span> ';
            if (repr) {
                $deck.empty();
                $deck.append("<div>" + killButton + repr + "</div>");
            } else {
                $("#"+id+"_on_deck > div").prepend(killButton);
            }
            $("#kill_"+id).click(function() {
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
            addKiller(null);
        }

        $this.bind('didAddPopup', function(event, pk, repr) {
            ui = { item: { pk: pk, desc: repr } }
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
                addKiller(ui.item.desc, pk);
                $text.val('');
                $deck.trigger("added");
            }

            return false;
        }

        function addKiller(repr, pk) {
            killer_id = "kill_" + pk + id
            killButton = '<span class="iconic" id="'+killer_id+'">X</span> ';
            $deck.append('<div id="'+id+'_on_deck_'+pk+'">' + killButton + repr + ' </div>');

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
            $.each(options.initial, function(i, its) {
                addKiller(its[0], its[1]);
            });
        }

        $this.bind('didAddPopup', function(event, pk, repr) {
            ui = { item: { pk: pk, desc: repr } }
            receiveResult(null, ui);
        });
    });
};

})(jQuery);


/* requires RelatedObjects.js */

function didAddPopup(win,newId,newRepr) {
    var name = windowname_to_id(win.name);
    $("#"+name).trigger('didAddPopup',[html_unescape(newId),html_unescape(newRepr)]);
    win.close();
}
