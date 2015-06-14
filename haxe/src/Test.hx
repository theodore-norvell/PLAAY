package ;
import js.Browser;
class Test {
    public function new() {

    }

    public static function main ()
    {
        var win = Browser.window;
        var document = win.document;
        var pEl = document.createElement("p");
        var text = document.createTextNode("Hello World via JavaScript");
        pEl.appendChild(text);
        //And we can add it to the document by doing:
        document.body.appendChild(pEl);
    }
}
