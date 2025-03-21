import React from "react";
import { useState,useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, useNavigate } from "react-router-dom";
import axios from 'axios';
import { set } from "mongoose";
import Spinner from "../Spinner";

export default function AdminRoute(){
    const [ok,setOk] = useState(false)
    const [auth,setAuth] = useAuth()
    const navigate = useNavigate();

    useEffect(() => {
        const authCheck = async() => {
          try {
            const res = await axios.get("/api/v1/auth/admin-auth");
            setOk(res.data.ok);
            if (!res.data.ok) navigate('/login');
          } catch (error) {
            navigate('/login');
          }
        };
        if (auth?.token) authCheck();
      }, [auth?.token, navigate]);
    
    return ok ? <Outlet /> : <Spinner/>;
}