import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DealerLocatorPage } from './dealer-locator.page';

describe('DealerLocatorPage', () => {
  let component: DealerLocatorPage;
  let fixture: ComponentFixture<DealerLocatorPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DealerLocatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
