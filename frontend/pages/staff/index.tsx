import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function StaffHome() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/staff/cases');
  }, [router]);
  return null;
}
