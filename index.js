$(document).ready(function () {
    $(".openbtn").on("click", function () {
        $(".ui.sidebar").toggleClass("very thin icon");
        $(".asd").toggleClass("marginlefting");
        $(".sidebar z").toggleClass("displaynone");
        $(".ui.accordion").toggleClass("displaynone");
        $(".ui.dropdown.item").toggleClass("displayblock");

        $(".logo").find('img').toggle();

    })
    $(".ui.dropdown").dropdown();

    $('.ui.accordion').accordion({
        selector: {

        }
    });
});