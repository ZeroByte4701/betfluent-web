import React from 'react';
import { connect } from 'react-redux';
import V0MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import MobileTopHeaderContainer from '../Containers/MobileTopHeaderContainer';
import { DepositService } from '../Services/BackendService';
import { getNewUid } from '../Services/DbService'
import { gMuiTheme, mobileBreakPoint } from './Styles';
import FakeDeposit from './FakeDeposit';
import creditCard from '../../Assets/credit-card/credit-card.png';
import mastercard from '../../Assets/mastercard.svg';
import visa from '../../Assets/visa.svg';
import amex from '../../Assets/amex.svg';
import discover from '../../Assets/discover.svg';
import dollarSign from '../../Assets/dollar-sign/dollar-sign.png';
import './Deposit.css';

class Deposit extends React.Component {
    constructor() {
        super();
        this.state = { selected: 20 }
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    
    componentDidMount() {
        window.mixpanel.track("Visit deposit page");
        window.paypal.Buttons({
            createOrder: (data, actions) => {
                // Set up the transaction
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: this.state.value || this.state.selected || 0
                        }
                    }]
                });
            },
            onApprove: (data, actions) => {
                const sessionRequest = {
                    id: getNewUid(),
                    orderID: data.orderID,
                    userId: this.props.userId
                }
                return actions.order.capture().then(() => {
                    // Call your server to save the transaction
                    window.mixpanel.track("Complete Deposit");
                    return DepositService(sessionRequest)
                        .then(({ status }) => {
                            if (status === 'success')
                                this.props.history.push('/');
                        });
                });
            }
        }).render('#paypal-button-container')
    }

    handleChange(e) {
        let error = false;
        if (e.target.value < 10) error = true;
        this.setState({ value: e.target.value, error });
    }

    handleClick(e) {
        this.setState({ selected: parseInt(e.target.id) });
    }

    render() {
        const { selected } = this.state;

        return (
            <V0MuiThemeProvider muiTheme={gMuiTheme}>
                <React.Fragment>
                    {this.props.size < mobileBreakPoint ? (
                        <MobileTopHeaderContainer />
                    ) : null}
                    <div className="deposit-wrapper">
                        <h1 className="deposit-funds">DEPOSIT FUNDS</h1>
                        <div className="deposit-card">
                            <div className="deposit-sub-card">
                                <img
                                    src={creditCard}
                                    class="credit-card"
                                    alt="credit-card"
                                />
                                <div className="deposit-accept">We Accept The Following:</div>
                                <div className="deposit-credit-card-wrapper">
                                    <img className="deposit-card-icon" src={mastercard} alt="master card" />
                                    <img className="deposit-card-icon" src={visa} alt="visa" />
                                    <img className="deposit-card-icon" src={amex} alt="amex" style={{ marginTop: 3, height: 45 }} />
                                    <img className="deposit-card-icon" src={discover} alt="discover" />
                                </div>
                            </div>
                            <div className="deposit-page">
                                <div className="deposit-amount-title">AMOUNT:</div>
                                <div className="deposit-choices">
                                    <div id={20} className={`deposit-choice ${selected === 20 && 'selected'}`} onClick={this.handleClick}><span id={20} className={`deposit-choice-text ${selected === 20 && 'selected'}`}>$20</span></div>
                                    <div id={50} className={`deposit-choice ${selected === 50 && 'selected'}`} onClick={this.handleClick}><span id={50} className={`deposit-choice-text ${selected === 50 && 'selected'}`}>$50</span></div>
                                    <div id={100} className={`deposit-choice ${selected === 100 && 'selected'}`} onClick={this.handleClick}><span id={100} className={`deposit-choice-text ${selected === 100 && 'selected'}`}>$100</span></div>
                                </div>
                                <div className="deposit-choice-custom">
                                    <img src={dollarSign} alt="dollar-sign" className="dollar-sign" />
                                    <TextField
                                        className="deposit-input"
                                        style={{ display: 'block', flexGrow: 1, marginLeft: 18, marginBottom: -12 }}
                                        value={this.state && this.state.value}
                                        onChange={this.handleChange}
                                        placeholder="Ex. 500"
                                        type="number"
                                    />
                                </div>
                                <div className={`error ${!this.state.error && 'hidden-space'}`}>You must depost more than $10 to initiate a transaction.</div>
                                {this.state.error && <FakeDeposit />}
                                <div id="paypal-button-container" className={`deposit-buttons ${this.state.error && 'hidden'}`} />
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </V0MuiThemeProvider>
        )
    }
}

const mapStateToProps = state => ({
    userId: state.user && state.user.user.id || ''
})

export default connect(mapStateToProps)(Deposit);