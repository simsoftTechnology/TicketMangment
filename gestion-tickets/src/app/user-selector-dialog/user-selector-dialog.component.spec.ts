import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectorDialogComponent } from './user-selector-dialog.component';

describe('UserSelectorDialogComponent', () => {
  let component: UserSelectorDialogComponent;
  let fixture: ComponentFixture<UserSelectorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSelectorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
