

import React,{ useState }  from 'react'
import fmTngLogo from '../../assets/svgs/fmtnglogo.svg'
import TextField from '@material-ui/core/TextField';
import PrimaryButton from '../../components/Button/Button'
import { useSubmitEmail } from '@Hook/useSubmitEmail';
import { routes } from 'src/constants/routes.constant';
import { useHistory } from 'react-router-dom';
import './SubmitEmail.scss'
import clsx from 'clsx';
import {  makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  bold:{
    fontWeight: theme.typography.platformFontWeight,
  },
}));

export default function SubmitEmail(props){
    const classes = useStyles();
    const history = useHistory();
    const [email,setEmail] = useState('')
    const {submitEmailCallAble} = useSubmitEmail();
    const handleClick =(e)=>{
        submitEmailCallAble(handleNavigate,email)
    }
    const handleNavigate=()=>{
        history.push(({ pathname: routes.home}))
    }
    const handleEmail=(value)=>{
        setEmail(value)
    }
    return (
        <div>
            <div className='submit_email-body_container'>
                <div className='submit_email-logo_container'>
                    <img src={fmTngLogo} alt={"Family Mart"}/>
                    <h3 className={clsx('submit_email-title', classes.bold)}>FamilyMart</h3>
                </div>
                <div className='submit_email-text_field_container'>
                    <p className={clsx('submit_email-text_field_title', classes.bold)}>Please enter your email address here</p>
                    <TextField variant="outlined" fullWidth={true} placeholder='Email address' onChange={(e)=>{handleEmail(e.target.value)}}/>
                    <p className='submit_email-text_field_desc'> Your order status notification will be updated via email</p>

                    <PrimaryButton handleClick={handleClick} title='Submit' className='submit_email-submit_button'/>
                </div>
            </div>

        </div>
    )
}