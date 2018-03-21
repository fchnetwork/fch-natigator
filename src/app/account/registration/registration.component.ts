import { Component, NgZone, OnInit, Inject, ChangeDetectorRef, ElementRef, OnChanges, ViewChild, ChangeDetectionStrategy, ViewContainerRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PasswordValidator } from '../../shared/helpers/validator.password';
import { testAccount } from '../../shared/helpers/data.mock';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { AvatarSelectComponent } from '../components/avatar-select/avatar-select.component';
import { MatDialog } from '@angular/material';
import { RegistrationDialog } from './registration.dialog'
import { AuthenticationService } from '../services/authentication-service/authentication.service';
import { selectedSeedPhrase } from '../../shared/app.interfaces'
import * as bip39  from 'bip39'




@Component({
// changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-registration',
templateUrl: './registration.component.html',
styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, OnChanges {


	@ViewChild('canvas') canvasRef:ElementRef;

	activeAvatar: number = 1; // default activeAvatar selected

	form: FormGroup; 

	page: string = 'create';  // default page to show

	testAccount: any = testAccount;

	seed: Array<any> = [];

	cloneSeedArray: Array<any> = [];

	items: selectedSeedPhrase[];

	selectedItems: selectedSeedPhrase[];

	AerAddressData: any; // data returned from the API

	seedsMatchNotification: string;

	isEqual: boolean = false; // checks the seed array and the randomised one to see if the user clicked the right order

	// AerumAPIcreateAddress: string = "http://localhost:3030/create-aer-address" // api address

	payload: any = { // payload to send to the api - this is just a skeleton 
		avatar: 1,
		password: "",
		mnemonic: "", 
		address: "",
		extendedPrivateKey: "",
		extendedPublicKey: "",	
	}         
	
	constructor( public toastr: ToastsManager, 
				 public vcr: ViewContainerRef,
				 public authServ: AuthenticationService,
				 public formBuilder: FormBuilder,
				 private cd: ChangeDetectorRef,
				 public zone: NgZone,
				 public dialog: MatDialog ) {
				 this.toastr.setRootViewContainerRef(vcr);
	}

  /** 
   * @name openDialog()
   * @desc Opens a modal with information about the users seed - when closed it executes openBackupSeed() which forwards to the next step
  */
	openDialog(): void {
		let dialogRef = this.dialog.open( RegistrationDialog, {
			width: '540px',
			panelClass:"o-modal-panel",
			backdropClass: "backdrop",
		});
		dialogRef.afterClosed().subscribe(result => {
			if( result ){
				this.openBackupSeed()
			}
		});
	}

  /** 
   * @name openBackupSeed()
   * @desc When executed forwards to the next step
  */  
	openBackupSeed(){
		this.page = "backupSeed"
	}

  /** 
   * @name onSubmit()
   * @desc If the Password form has a valid password it sets the payload with the selected password, 
   *       user avatar and Mneumonic seed generated ready to post to the auth API
  */    
	onSubmit() {
		if (this.form.valid) {

			this.payload = {
				avatar: this.form.value.avatar.avatar,
				password: this.form.value.password,
				mnemonic: this.form.value.avatar.seed, 
				address: this.form.value.avatar.address,
				extendedPrivateKey: this.form.value.avatar.privExtend,
				extendedPublicKey: this.form.value.avatar.pubExtend,				
			}

		this.seed = this.payload.mnemonic.split(" ")
	
	
		console.log( this.payload.mnemonic )
	this.newSeedConfirm();
		// console.log("this.form.value.avatar "+ JSON.stringify( this.payload, null, 2 ) );
			this.page = "backupLanding"

		}
	//	this.cd.detectChanges();
	}

  /** 
   * @name backupSeedPhrase()
   * @desc Opens the Seed Information Dialog above
  */     
	backupSeedPhrase(){
		this.openDialog()
	}

  /** 
   * @name confirmSeedPhrase()
   * @desc When executed forwards to the next step
  */    
	confirmSeedPhrase() {
		this.page= "ConfirmSeed"
	}    

  /** 
   * @name generateAerAddress() THIS FUNCTION IS NO LONGER NECESSARY
   * @desc When executed forwards to the next step and also sends the Auth payload to the API Service
  */    
	generateAerAddress() {
		this.page= "userAuthenticated"

		let showAuthData = this.authServ.generateAccount( this.payload );
		// let showAuthData = this.authServ.generateAerumAddress( this.AerumAPIcreateAddress, this.payload )
					showAuthData.then( async res =>  this.AerAddressData = res );
				//	console.log( "Address generated here:" + JSON.stringify(this.AerAddressData) );
	}

  /** 
   * @name newSeedConfirm()
   * @desc Creates a randomized version of the Seed Phrase so that the user has to select it in the right order
  */      
	newSeedConfirm() {
		this.items = this.shuffleArray( this.seed.slice() ).map(x => ({ name: x, selected: false }));
		this.selectedItems = [];
	}

  /** 
   * @name ngOnInit()
   * @desc Generates a new BIP39 Mneumonic Seed and maps it to an array, Executes newSeedConfirm to create a random seed 
   *       builds the form using Angular Reactive forms module
  */     
	ngOnInit() {


	// console.log( JSON.stringify(	this.authServ.avatarsGenerator() ) )



		// this.authServ.generateAddress(this.seed).then( (res) => {
		// 	console.log(this.seed)
		// 	console.log(res)
		// })

		this.form = this.formBuilder.group({});  
		this._buildForm();  
	///	console.log( "Using this seed " + this.seed);
	}

  /** 
   * @name selectedSeedPhrase()
   * @desc User Generates a new Array by selecting the Seed in the correct order - it compares the result using compareResult() method
  */     
	select(item: selectedSeedPhrase) {
		if (item.selected) {
			return;
		}
		this.selectedItems.push(item);
		item.selected = true;
		if (this.selectedItems.length === this.seed.length) {
			this.compareResult();
		}
	}

  /** 
   * @name unSelect()
   * @desc Unselect an item in the selected array puzzle
  */     
	unSelect(item: selectedSeedPhrase, idx: number) {
		item.selected = false;
		this.selectedItems.splice(idx, 1);
	}

  /** 
   * @name compareResult()
   * @desc Compare the order of the user selected seed with the actual seed in the array puzzle
  */    
	compareResult() {
		if (this.selectedItems.map(x => x.name).toString() === this.seed.toString()) {
			this.isEqual = true;
			// console.log('They are in the same order')
		} else {
			this.isEqual = false;
			// console.log('They have different order')
		}
	}

  /** 
   * @name copyToClipboard()
   * @desc Copy seed to clipboard
  */      
	copyToClipboard() {
		this.showSuccess()
	}  

  /** 
   * @name _buildForm()
   * @desc Build the password/avatar form and enable Validators
  */    
	_buildForm() {             
		this.form = this.formBuilder.group({
			password: [ this.testAccount[0]["password"], [Validators.required, Validators.minLength(10), PasswordValidator.number, PasswordValidator.upper, PasswordValidator.lower ] ],
			confirmpassword: [this.testAccount[0]["passwordConfirm"], [Validators.required ] ],
			avatar: [1]
		},{ 
			validator: this.matchingPasswords('password', 'confirmpassword')
		});
	}   

  /** 
   * @name matchingPasswords()
   * @desc Custom validator to make sure the password and confirm password match
  */    
	matchingPasswords( passwordKey: string, passwordConfirmationKey: string ) {
		return (group: FormGroup ) => {
			let passwordInput = group.controls[passwordKey];
			let passwordConfirmationInput = group.controls[passwordConfirmationKey];
			if (passwordInput.value !== passwordConfirmationInput.value ) {
				return passwordConfirmationInput.setErrors({notEquivalent: true})
			}
		}
	}

  /** 
   * @name shuffleArray()
   * @desc Shuffle the seed to the seed user puzzle
  */      
	shuffleArray(arr) {
		for (let c = arr.length - 1; c > 0; c--) {
			let b = Math.floor(Math.random() * (c + 1));
			let a = arr[c];
			arr[c] = arr[b];
			arr[b] = a;
		}
		return arr;
	}

  /** 
   * @name logError()
   * @desc Copy to clipboard directive error log
  */ 
	public logError( error: Error ) : void {
		this.showError();
		console.group( "Clipboard Error" );
		console.error( error );
		console.groupEnd();
	}

  /** 
   * @name logSuccess()
   * @desc Copy to clipboard directive success message - executes	showSuccess()
  */ 
	public logSuccess( value: string ) : void {
		this.showSuccess()
		console.group( "Clipboard Success" );
		console.log( value );
		console.groupEnd();
	}

  /** 
   * @name ngOnChanges()
   * @desc Issues with angular change detection strategy - will come back to this
  */   
	public ngOnChanges(): void {
		console.info("user-view-push changed");
	} 

  /** 
   * @name showSuccess()
   * @desc Copy to clipboard success toaster message
  */     
	showSuccess() {
		this.toastr.success('Seed phrase copied to clipboard', 'Success!');
	}

  /** 
   * @name showError()
   * @desc Copy to clipboard error toaster message
  */    
	showError() {
		this.toastr.error('There was a problem copying seed phrase', 'Oops!');
	}

}
