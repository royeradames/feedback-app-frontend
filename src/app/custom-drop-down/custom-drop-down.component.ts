import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-drop-down',
  templateUrl: './custom-drop-down.component.html',
  styleUrls: ['./custom-drop-down.component.scss'],
})
export class CustomDropDownComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  isHidden: boolean = true;
  isFocus: boolean = false;

  optionList = [
    {
      inputName: 'category',
      inputValue: 'feature',
      label: 'Feature',
    },
    {
      inputName: 'category',
      inputValue: 'UX',
      label: 'UX',
    },
    {
      inputName: 'category',
      inputValue: 'enhancement',
      label: 'Enhancement',
    },
    {
      inputName: 'category',
      inputValue: 'bug',
      label: 'Bug',
    },
  ];
}
