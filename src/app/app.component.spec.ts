import { TestBed, flush } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TestScheduler } from 'rxjs/testing';
import { throttleTime } from 'rxjs';

const testScheduler = new TestScheduler((actual, expected) => {
  // asserting the two objects are equal - required
  // for TestScheduler assertions to work via your test framework
  // e.g. using chai.
  expect(actual).toEqual(expected);
});

describe('AppComponent', () => {

  let fixture: any;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'marble' title`, () => {
    expect(component.title).toEqual('marble');
  });

  it('should render title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, marble');
  });

  it('generates the stream correctly', () => {
    testScheduler.run((helpers) => {
      const { cold, time, expectObservable, expectSubscriptions } = helpers;
      const e1 = cold(' -a--b--c---|');
      const e1subs = '  ^----------!';
      const t = time('   ---|       '); // t = 3
      const expected = '-a-----c---|';

      expectObservable(e1.pipe(throttleTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('when setFlag was called, should load data and set flag', () => {
    testScheduler.run((helpers) => {
      const { cold, flush } = helpers;
      const flags = cold('a--b--a', { a: 'fake', b: 'notfake' });

      (component as any).setFlag(flags);

      flush();
      expect(component.fakeFlag).toBe(true);
    });
  });

  it('when setFlag was called with error, should not set flag', () => {
    testScheduler.run((helpers) => {
      const { cold, flush } = helpers;
      const flags = cold('#');

      (component as any).setFlag(flags);
      flush();

      expect(component.fakeFlag).toBe(false);
    });
  });


  it('when ngOnDestroy was called, should unsubscribe', () => {
    testScheduler.run((helpers) => {
      const { hot, expectSubscriptions, flush } = helpers;
      const flags = hot('                  a--b--a');
      const destroys = hot('               ---a|');
      const expectSubs = '-----------------^--! ';


      (component as any).service$ = flags;
      (component as any).destroy$ = destroys;
      (component as any).ngOnInit();
      flush();
      (component as any).ngOnDestroy();

      expectSubscriptions(flags.subscriptions).toBe(expectSubs);
    });
  });


});
