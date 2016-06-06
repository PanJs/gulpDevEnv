#Jasmine BDD

http://jasmine.github.io/2.0/introduction.html

```
//可嵌套
describe("A suite", function() {
  var timerCallback;
  beforeEach(function() {
    this.foo = 0;

    timerCallback = jasmine.createSpy("timerCallback");
    jasmine.clock().install();
  });
  afterEach(function() {
    foo = 0;

    jasmine.clock().uninstall();
  });
  it("contains spec with an expectation", function() {

    setTimeout(function() {
      timerCallback();
    }, 100);

    expect(timerCallback).not.toHaveBeenCalled();

    jasmine.clock().tick(101);

    expect(timerCallback).toHaveBeenCalled();

    expect(a).toBe(true);
    expect(a).not.toBe(null);
    expect(a).toEqual(12);
    expect({}).toEqual(jasmine.any(Object));
    expect(foo).toEqual(jasmine.objectContaining({
      bar: "baz"
    }));
    expect(message).toMatch("bar");
    expect(message).not.toMatch(/quux/);
    expect(a.foo).not.toBeUndefined();
    expect(a.bar).toBeUndefined();
    expect(a).toBeNull();
    expect(foo).not.toBeNull();
    expect(foo).toBeTruthy();
    expect(a).not.toBeTruthy();
    expect(a).toBeFalsy();
    expect(foo).not.toBeFalsy();
    //inArray
    expect(a).toContain("bar");
    expect(a).not.toContain("quux");
    expect(e).toBeLessThan(pi);
    expect(pi).not.toBeLessThan(e);
    expect(pi).toBeGreaterThan(e);
    expect(e).not.toBeGreaterThan(pi);
    expect(pi).not.toBeCloseTo(e, 2);
    expect(pi).toBeCloseTo(e, 0);
    // if a function throws an exception
    expect(foo).not.toThrow();
    expect(bar).toThrow();
    expect(foo).toThrowError("foo bar baz");
    expect(foo).toThrowError(/bar/);
    expect(foo).toThrowError(TypeError);
    expect(foo).toThrowError(TypeError, "foo bar baz");
  });
});

//Pending specs do not run, but their names will show up in the results as pending.
describe("Pending specs", function() {
  xit("can be declared 'xit'", function() {
    expect(true).toBe(false);
  });
  it("can be declared with 'it' but without a function");
  it("can be declared by calling 'pending' in the spec body", function() {
    expect(true).toBe(false);
    pending();
  });
});

describe("A spy, when configured to call through", function() {
  var foo, bar, fetchedBar;

  beforeEach(function() {
    foo = {
      setBar: function(value) {
        bar = value;
      },
      getBar: function() {
        return bar;
      }
    };

    spyOn(foo, 'getBar').and.callThrough();
    //spyOn(foo, "getBar").and.returnValue(745);
    //spyOn(foo, "getBar").and.callFake(function() {
    //  return 1001;
    //});
    //spyOn(foo, "setBar").and.throwError("quux");
    //var spy = jasmine.createSpy('spy');
    //tape = jasmine.createSpyObj('tape', ['play', 'pause', 'stop', 'rewind']);

    foo.setBar(123);
    fetchedBar = foo.getBar();
  });

  it("tracks that the spy was called", function() {
    expect(foo.getBar).toHaveBeenCalled();
  });

  it("should not affect other functions", function() {
    expect(bar).toEqual(123);

    //foo.setBar.and.stub();
    //expect(foo.setBar.calls.any()).toEqual(false);
    //expect(foo.setBar.calls.count()).toEqual(0);
    //expect(foo.setBar.calls.argsFor(0)).toEqual([123]);
    //expect(foo.setBar.calls.allArgs()).toEqual([[123],[456, "baz"]]);
    //expect(foo.setBar.calls.all()).toEqual([{object: foo, args: [123]}]);
    //expect(foo.setBar.calls.mostRecent()).toEqual({object: foo, args: [456, "baz"]});
    //expect(foo.setBar.calls.first()).toEqual({object: foo, args: [123]});
    //foo.setBar.calls.reset();
  });

  it("when called returns the requested value", function() {
    expect(fetchedBar).toEqual(123);
  });
});

```