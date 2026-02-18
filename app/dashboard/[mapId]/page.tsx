import MindMapClient from './ui/MindMapClient';

export default async function MindMapPage({
  params,
}: {
  params: Promise<{ mapId: string }>;
}) {
  const { mapId } = await params;

  return (
    <MindMapClient mapId={mapId} />
  );
}


