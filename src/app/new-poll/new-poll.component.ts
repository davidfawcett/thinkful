import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFire, FirebaseListObservable, AngularFireAuth } from 'angularfire2';
import { Poll } from './poll.interface';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'app-new-poll',
  templateUrl: './new-poll.component.html',
  styleUrls: ['./new-poll.component.css']
})
export class NewPollComponent implements OnInit {
  polls: FirebaseListObservable<any[]>;
  users: FirebaseListObservable<any[]>;
  clients: FirebaseListObservable<any[]>;
  poll: FormGroup
  slide: boolean;
  multichoice: boolean;
  currentClient: Subject<any>;
  iphoneImagePath: string;

  constructor(private fb: FormBuilder, public af: AngularFire) {

  this.currentClient = new Subject();
  this.clients = af.database.list('/users', {
    query: {
      orderByKey: true,
      equalTo: this.currentClient
    }
  })
 }

  ngOnInit() {
    this.slide = false;
    this.initUsers();
    this.iphoneImagePath = 'assets/images/iphone.png'
    this.poll = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    clientID: ['', Validators.required],
    clientName: ['', ],
    button: ['Submit', Validators.required],
    sliders: this.fb.group({
      slider: this.fb.array([
        //initSlider() initalized with showSlider()
        //this.initSlider()
      ])
    }),
    multi: this.fb.group({
      question: ['', ],
      choices: this.fb.array([
        // Don't init on ngOnInit, instead should init on +showChoice() button
        // this.initChoice()
      ])
    })
});
    // this.users.subscribe(client => {
    //   console.log(client)
    // });
  }
  onSubmit({ value, valid }: { value: Poll, valid: boolean }) {
    console.log(value, valid);
    const polls = this.af.database.list('/polls');
    // Beware: This is a bit of a cludge.
    // The validation is necessary but without it the control.push() functions
    // in addChoice() and addSlider() were pushing the form to the database. The
    // validation stops this from happening but only because the fields in those
    //  forms are not populated with valid values by default.
    // this.poll.reset() also seems to be submitting the form.
    // Sort of fixed by moving onSubmit() to the submit button.
    if (valid){
      //creates additional client information from clientid
      polls.push(value);
      this.clearPoll()
    }
    else{
      console.log('pollForm is Invalid')
    }
  }
  clearPoll(){
    this.poll.reset();
    this.poll.get('button').setValue('Submit')
    this.removeAllChoices();
    this.removeAllSliders();
  }
  showSlider(){
    this.initSlider();
    this.addSlider()
    this.slide = true;
  }
  initUsers(){
    this.users = this.af.database.list('/users');
  }
  initChoice(){
    return this.fb.group({
      choice: ['', Validators.required]
    })
  }
  initSlider(){
    return this.fb.group({
      slideName: ['', ],
      max: ['5', Validators.required],
      label1: ['', Validators.required],
      label2: ['', Validators.required]
    })
  }
  showChoice(){
    this.initChoice();
    this.addChoice();
    this.multichoice = true;
  }
  addChoice(){
    // See here for why using ['property'] instead of .property:
    // http://stackoverflow.com/questions/41950360/angular2-property-controls-does-not-exist-on-type-abstractcontrol-error-wh
    // TODO: Change to using .get() to improve readability
    const control = this.poll.get('multi')['controls']['choices'];
    control.push(this.initChoice());
  }
  removeChoice(i: number, length: number){
    if (i==0 && length == 1){
      this.multichoice=false;
      const question = this.poll.get('multi').get('question');
      question.setValue('')
    };
    const control = this.poll.controls['multi']['controls']['choices'];
    control.removeAt(i);
  }
  removeAllChoices(){
    this.multichoice = false;
    const question = this.poll.get('multi').get('question');
    question.setValue('')
    const control = this.poll.controls['multi']['controls']['choices'];
    while (control.length){control.removeAt(0)};
  }
  addSlider(){
    const control = this.poll.controls['sliders']['controls']['slider'];
    control.push(this.initSlider());

  }
  removeSlider(i: number, length: number){
    if (i==0 && length == 1){this.slide=false};
    const control = this.poll.controls['sliders']['controls']['slider'];
    control.removeAt(i);
  }
  removeAllSliders(){
    this.slide = false;
    const control = this.poll.controls['sliders']['controls']['slider'];
    while (control.length){control.removeAt(0)};
  }
  updateClient(value){
    //broken - doesn't work on first value

    this.clients.subscribe(client => {
      this.poll.get('clientName').setValue(client[client.length-1].username) ;
      // console.log(this.poll.value.clientName);
      // console.log(this.poll)
    })
    this.currentClient.next(value);
    console.log(value)
  }
  tester(){
    console.log('TEST WORKED')
  }
}
