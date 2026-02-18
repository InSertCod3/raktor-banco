import LoadingModal from '@/app/components/LoadingModal';

export default function Loading() {
  return <LoadingModal isOpen title="Opening map" description="Loading nodes and connections..." />;
}
