const useToken = () => {
  const token =  sessionStorage.getItem("dwpps_token");
  const profileData = JSON.parse(sessionStorage.getItem("profileData") || "{}");
  return { token, profileData };
};

export default useToken;