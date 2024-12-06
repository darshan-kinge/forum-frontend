import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
// import './App.css'
const Home = lazy(() => import('./pages/home/Home.jsx'));
const Login = lazy(() => import('./pages/admin/login/Login.jsx'));
const JoinUs = lazy(() => import('./pages/join-us/JoinUs.jsx'));
const Team = lazy(() => import('./pages/team/Team.jsx'));
const MemberBadge = lazy(() => import('./pages/join-us/badge/MemberBadge.jsx'));
const VerifyBadge = lazy(() => import('./pages/join-us/badge/VerifyBadge.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/layout/AdminLayout.jsx'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery/AdminGallery.jsx'));
const Gallery = lazy(() => import('./pages/gallery/Gallery.jsx'));
const Dashboard = lazy(() => import('./pages/admin/dashboard/Dashboard.jsx'));

import { AuthProvider, useAuth } from './context/AuthContext.jsx'

import Navbar from './components/navbar/Navbar.jsx'
import Footer from './components/footer/Footer.jsx'
import Loader from './components/loader/Loader.jsx';
import AdminBlog from './pages/admin/AdminBlog/AdminBlog.jsx';
import BlogForm from './components/adminBlogForm/BlogForm.jsx';
import AdminBlogList from './pages/admin/AdminBlog/AdminBlogList/BlogList.jsx';
import BlogPage from './pages/blog/BlogPage.jsx';
import BlogView from './pages/blog/BlogPage/Blog.jsx';
import EventsPage from './pages/events/EventPage.jsx';
import EventDetail from './pages/events/EventDetails/EventDetail.jsx';
import AdminEventsPage from './pages/admin/AdminEvent/AdminEvents.jsx';
import AdminTeamPage from './pages/admin/AdminTeam/AdminTeamPage.jsx';
import AdminMember from './pages/admin/AdminMember/AdminMember.jsx';
import Certificate from './pages/join-us/Certificate.jsx';
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={ <Loader /> }>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/join-us' element={<JoinUs />} />
            <Route path='/team' element={<Team />} />
            <Route path='/gallery' element={<Gallery />} />
            <Route path='/login' element={<Login />} />
            <Route path= '/blogs' element={ <BlogPage /> } />
            <Route path='/blogs/:slug' element={ <BlogView /> } />
            <Route path='/events' element={<EventsPage /> } />
            <Route path='/events/:id' element={<EventDetail />} />
            <Route path='/certificate' element={<Certificate />} />



            <Route path='/admin/login' element={<Login />} />

            <Route path='/member/badge/:id' element={<MemberBadge />} />
            <Route path='/member/badge/verify/:id' element={<VerifyBadge />} />

            <Route path='*' element={<h1>404 Not Found</h1>} />

            <Route path='admin' element={<AdminLayout />}>
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='members' element={<AdminMember />} />
              <Route path='gallery' element={<AdminGallery />} />
              <Route path='blog' element={ <AdminBlog /> } >
                <Route index element={ <AdminBlogList /> } />
                <Route path='new' element={<BlogForm />} />
                <Route path='edit/:slug' element={ <BlogForm editMode /> } />
              </Route>
              <Route path='team' element={<AdminTeamPage />} />
              <Route path='events' element={<AdminEventsPage />} />
            </Route>
          </Routes> 
        </Suspense>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
