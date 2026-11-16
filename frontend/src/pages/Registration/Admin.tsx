// import * as React from "react";
// import AppLayout from "@/components/AppLayout.tsx";
// import AdminTable from "@/components/adminRegistration/AdminTable";
// import AddAdminModal from "@/components/adminRegistration/addAdmin";

// export default function AdminRegistration(): JSX.Element {
//     const [open, setOpen] = React.useState(false);

//     return (
//         <AppLayout>
//             <div className="p-4 pt-4 sm:p-6 sm:pt-6 lg:p-8 lg:pt-8">
//                 <AdminTable onAddClick={() => setOpen(true)} />
//             </div>

//             <AddAdminModal
//                 open={open}
//                 onOpenChange={setOpen}
//             />
//         </AppLayout>
//     );
// }
import React from 'react'

const Admin = () => {
  return (
    <div>
      <h1>Admin Registration</h1>
    </div>
  )
}

export default Admin
