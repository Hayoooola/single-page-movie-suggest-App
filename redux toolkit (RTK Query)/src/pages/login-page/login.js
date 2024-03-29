import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jwtDecode from 'jwt-decode';
import "./login.css";

import { useLoginRequestMutation } from '../../API/authApi';
import { checkLoginStatus } from '../../features/auth-features/checkLoginStatus';
import { visitAlready } from '../../features/auth-features/isUserFirstTimeVisitPage';
import { SubmitButton } from '../../components/submitButton';
import logo from "../../assets/images/hayoola-logo.png";
import { LoggedInUsers } from '../../components/content-to-logged-in-users/loginContent';

export const LoginPage = () => {
    const [loginRequest, { data, isLoading, isError, error }] = useLoginRequestMutation();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isFirstTImeVisit } = useSelector(store => store.firesTimeVisit);
    const isUserLogin = useSelector(store => store.loginStatus.isUserLogin);

    // update login data
    useEffect(() => {
        if (data) {
            putLoginInformationToLocalStorage(data.access_token);
            dispatch(checkLoginStatus());
        }
    }, [data]);

    // manage toasts & errors
    useEffect(() => {
        if (isUserLogin && isFirstTImeVisit) {
            navigate("/");
            // showing success toast
            toast.success('Login successful', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            // dispatching this action will prevent users redirecting to home page after login
            dispatch(visitAlready());
        }
        // showing toast errors
        if (isError) {
            const error401 = /401/g;
            if (error401.test(error.data.message)) {
                toast.error("Incorrect Username or Password!", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            } else {
                toast.error(error.data.message, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }


        }
    }, [isFirstTImeVisit, isUserLogin, isError, data]);

    // needs for manage input Errors
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const validate = (values) => {
        const errors = {};

        if (!values.username) {
            setUsernameError(true);
            errors.username = "required";
        } else {
            setUsernameError(false);
        }
        if (!values.password) {
            setPasswordError(true);
            errors.password = "required";
        } else {
            setPasswordError(false);
        }
        return errors;
    };

    // validating form using formik library
    const formik = useFormik({
        initialValues: {
            username: "",
            password: ""
        },
        validate,
        onSubmit: values => {
            const userName = values.username;
            const password = values.password;
            loginRequest({ userName, password });
        }
    });

    // showing toast error on submit button
    const toastInputErrors = () => {
        if (usernameError) {
            toast.error("Username is required!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }

        if (passwordError) {
            toast.error("Password is required!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    const itemsToShow = () => {
        if (isUserLogin) {
            return <LoggedInUsers />;

            // showing items to UnAuthorized users
        } else {
            return (
                <section className="gradient-form d-flex align-items-center" style={{ backgroundColor: "#eee" }}>
                    <div className="container">
                        <div className="row d-flex justify-content-center align-items-center">
                            <div className="col-xl-10">
                                <div className="card rounded-3 text-black">
                                    <div className=" g-0 row">
                                        <div className="col-lg-6">
                                            <div className="card-body p-md-5 mx-md-4">
                                                <div className="text-center">
                                                    <img
                                                        src={logo}
                                                        style={{ width: 185 }}
                                                        alt="logo"
                                                    />
                                                    <h4 className="mt-1 mb-5 pb-1">We are The Hayoola Team</h4>
                                                </div>
                                                <form onSubmit={formik.handleSubmit}>
                                                    <p>Please login to your account</p>
                                                    <div className="form-outline mb-4 ">
                                                        <TextField
                                                            className='w-100'
                                                            label="Username"
                                                            id="username"
                                                            placeholder='Email address or Phone number'
                                                            size="small"
                                                            onChange={formik.handleChange}
                                                            value={formik.values.username}
                                                            error={usernameError}
                                                        />
                                                    </div>
                                                    <div className="form-outline mb-4">
                                                        <TextField
                                                            className='w-100'
                                                            label="Password"
                                                            id="password"
                                                            placeholder='Your password'
                                                            size="small"
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.password}
                                                            error={passwordError}
                                                        />
                                                    </div>
                                                    <div className="text-center pt-1 mb-5 pb-1 w-100">
                                                        <SubmitButton
                                                            loading={isLoading}
                                                            customClassName="btn-outline-none gradient-custom-2 w-100"
                                                            buttonText="Login"
                                                            onClick={toastInputErrors}
                                                        />
                                                        <p className="text-muted" href="#!">
                                                            Forgot password?
                                                        </p>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-center pb-4">
                                                        <p className="mb-0 me-2">Don't have an account?</p>
                                                        <Link to="/sign-up">
                                                            <button type="button" className="btn btn-outline-danger">
                                                                Create new
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 gradient-custom-2 d-flex align-items-center">
                                            <div className="text-white px-3 p-md-5 mx-md-4">
                                                <h4 className="mb-5">We are more than just a company</h4>
                                                <p className="small mb-0">
                                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                                                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                                                    laboris nisi ut aliquip ex ea commodo consequat.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </section>
            );
        }
    };

    return (
        itemsToShow()
    );
};

// putting data in localStorage
const putLoginInformationToLocalStorage = (token) => {
    localStorage.setItem("token", JSON.stringify(token));

    const decodedToken = jwtDecode(token);

    localStorage.setItem("email", JSON.stringify(decodedToken.email));
    localStorage.setItem("iat", JSON.stringify(decodedToken.iat));
    localStorage.setItem("exp", JSON.stringify(decodedToken.exp));
};