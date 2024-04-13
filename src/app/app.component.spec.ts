import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TestScheduler } from 'rxjs/testing';

let testScheduler: any;

describe('AppComponent', () => {

  let fixture: any;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
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

  it('should have a service', () => {
    expect((component as any).service).toBeTruthy();
  });

  it('when setFlag was called, should load data and set flag to true', () => {
    testScheduler.run((helpers) => {
      const { cold, flush, expectObservable, expectSubscriptions } = helpers;
      const flags = cold('     b--a--a ', { a: 'fake', b: 'notfake' });
      const destroys = cold('  -----a| ');
      const expectFlags = '    b--a-|  ';
      const expectSubs = '     ^----!  ';

      (component as any).destroy$ = destroys;
      const flagsReceived = (component as any).setFlag(flags);

      expectObservable(flagsReceived).toBe(expectFlags, { a: 'fake', b: 'notfake' });
      expectSubscriptions(flags.subscriptions).toBe(expectSubs);

      flush();
      (component as any).destroy$ = {
        next: jest.fn(),
        complete: jest.fn()
      };
      expect(component.fakeFlag).toBe(true);
    });
  });

  it('when setFlag was called, should load data and set flag to false', () => {
    testScheduler.run((helpers) => {
      const { cold, flush, expectObservable, expectSubscriptions } = helpers;

      const flags = cold('     b--a--a ', { a: 'fake', b: 'notfake' });
      const destroys = cold('  --a|    ');
      const expectFlags = '    b-|     ';
      const expectSubs = '     ^-!     ';

      (component as any).destroy$ = destroys;
      const flagsReceived = (component as any).setFlag(flags);

      expectObservable(flagsReceived).toBe(expectFlags, { a: 'fake', b: 'notfake' });
      expectSubscriptions(flags.subscriptions).toBe(expectSubs);

      // Note: Sincrroniza execução para avaliar o resultado da flag
      flush();
      expect(component.fakeFlag).toBe(false);

      // NOTE: Como o destroy$ foi substituido ao chamar o ciclo
      // de vida, é necessário redefinir o destroy$ para evitar
      // problemas por metodos indefinidos.
      (component as any).destroy$ = {
        next: jest.fn(),
        complete: jest.fn()
      };
    });
  });

  it.each([
    [ 'b--a--a', 'b--a--a', true, 3 ],
    [ 'a--a--b', 'a--a--b', false, 3 ],
    [ 'b|a', 'b|', false, 1 ],
    [ 'a|a', 'a|', true, 1 ],
  ])('when setFlag was called with %s, should load data and set flag to %s', (diagram, expected, flag, times) => {
    testScheduler.run(helpers => {
      const { cold, flush, expectObservable } = helpers;

      const flags = cold(diagram, { a: 'fake', b: 'notfake' });
      const expectFlags = expected;

      jest.spyOn(console, 'log').mockImplementation(() => {}).mockClear();

      const flagsReceived = (component as any).setFlag(flags);

      expectObservable(flagsReceived).toBe(expectFlags, { a: 'fake', b: 'notfake' });

      // Note: Sincrroniza execução para avaliar o resultado da flag
      flush();
      expect(component.fakeFlag).toBe(flag);
      expect(console.log).toHaveBeenCalledTimes(times);
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


  it('when ngOnInit was called, should subscribe for flags', () => {
    testScheduler.frame = 0;
    testScheduler.run((helpers) => {
      const { cold, expectSubscriptions, flush } = helpers;
      const flags = cold('     a--b--a     ', { a: 'fake', b: 'notfake' });
      const destroys = cold('  -------(a|) ');
      const expectSubs = '     ^------!    ';

      (component as any).service$ = flags;
      (component as any).destroy$ = destroys;

      (component as any).ngOnInit();

      flush();
      (component as any).destroy$ = {
        next: jest.fn(),
        complete: jest.fn()
      };

      expectSubscriptions(flags.subscriptions).toBe(expectSubs);

    });
  });

  it('when ngOnDestroy was called, should unsubscribe', () => {
    (component as any).destroy$ = {
      next: jest.fn(),
      complete: jest.fn()
    };

    (component as any).ngOnDestroy();

    expect((component as any).destroy$.next).toHaveBeenCalled();
    expect((component as any).destroy$.complete).toHaveBeenCalled();
  });


});
