
＃Casper Testing

http://docs.casperjs.org/en/latest/testing.html

##Mac install (For the 1.1 development version (recommended))
* http://phantomjs.org/download.html
* sudo brew install casperjs --devel

```
casper.test.assert(true, "true's true");
casper.test.assertNot(!false, "truth is out");

casper.test.begin('assertDoesntExist() tests', 1, function(test) {
    casper.start().then(function() {
        this.setContent('<div class="heaven">beer</div>');
        test.assertElementCount('div', 1);
        test.assertExists('.heaven');
        test.assertDoesntExist('.taxes');
        test.assertEval(function() {
            return __utils__.findOne('.heaven').textContent === 'beer';
        });
        test.assertEvalEquals(function() {
            return __utils__.findOne('.heaven').textContent;
        }, 'beer');

        //填写表单元素
        this.fill('form[name="gs"]', { q: 'plop' }, false);
        test.assertField('q', 'plop');
    }).run(function() {
        test.assertEquals(1 + 1, 2);
        test.done();
    });
});

assertFalsy(Mixed subject[, String message])
assertField(String|Object input, String expected[, String message, Object options])
assertFieldName(String inputName, String expected[, String message, Object options])
assertFieldCSS(String cssSelector, String expected, String message)
assertFieldXPath(String xpathSelector, String expected, String message)
assertHttpStatus(Number status[, String message])
assertMatch(mixed subject, RegExp pattern[, String message])
assertNot(mixed subject[, String message])
assertNotEquals(mixed testValue, mixed expected[, String message])
assertNotVisible(String selector[, String message])

casper.test.assertRaises(function(throwIt) {
    if (throwIt) {
        throw new Error('thrown');
    }
}, [true], 'Error has been raised.');

assertSelectorDoesntHaveText(String selector, String text[, String message])


test.assertResourceExists(function(resource) {
    return resource.url.match('logo3w.png');
});
test.assertTextExists('google', 'page body contains "google"');
test.assertTitle('Google', 'google.fr has the correct title');
test.assertTitleMatch(/Google/, 'google.fr has a quite predictable title');

assertType(mixed input, String type[, String message])

var daisy = new Cow();
test.assertInstanceOf(daisy, Cow, "Ok, daisy is a cow.");

test.assertUrlMatch(/^http:\/\//, 'google.fr is served in http://');

this.clickLabel('Testing');

// cow-test.js
casper.test.begin('Cow can moo', 2, {
    setUp: function(test) {
        this.cow = new Cow();
    },

    tearDown: function(test) {
        this.cow.destroy();
    },

    test: function(test) {
        test.assertEquals(this.cow.moo(), 'moo!');
        test.assert(this.cow.mowed);
        test.done();
    }
});

colorize(String message, String style)

require('utils').dump(casper.test.getFailures());
require('utils').dump(casper.test.getPasses());

casper.start().userAgent('Mosaic 0.1');

casper.start('http://foo').then(function() {
    // ...
}).run(done);

test.skip(2, 'Two tests skipped');


//http://docs.casperjs.org/en/latest/modules/casper.html

casper.open('http://some.testserver.com/post.php', {
       method: 'post',
       headers: {
           'Content-Type': 'application/json; charset=utf-8'
       },
       encoding: 'utf8', // not enforced by default
       data: {
            'table_flip': '(╯°□°）╯︵ ┻━┻ ',
       }
});








```