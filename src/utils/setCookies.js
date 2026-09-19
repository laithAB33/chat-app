let setTokenCookie = (res,accessToken,refreshToken) => {

            res.cookie("refreshToken",refreshToken,{
                maxAge:1000 * 60 * 60 *24 * 365 ,
                httpOnly:true,
                secure : process.env.NODE_ENV == 'production',
                samesite: 'strict',
            })
        
            res.cookie("accessToken",accessToken,{
                maxAge:1000 * 60 * 30,
                httpOnly:true,
                secure : process.env.NODE_ENV == 'production',
                samesite: 'strict',
            })

}

let setDeviceCookie = (res,deviceId) => {

    res.cookie("deviceId",deviceId,{
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })
}

export {setTokenCookie, setDeviceCookie};