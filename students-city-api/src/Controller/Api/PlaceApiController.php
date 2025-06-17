<?php

namespace App\Controller\Api;

use App\Entity\Place;
use App\Form\PlaceType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class PlaceApiController extends AbstractController
{
    private const STATUS_VALIDATED = 'validé';
    private const STATUS_PENDING = 'En attente';
    private const DATE_FORMAT = 'Y-m-d H:i:s';
    #[Route('/api/places', name: 'api_place_create', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $place = new Place();
        $form = $this->createForm(PlaceType::class, $place);
        $form->submit($data);

        if (!$form->isSubmitted() || !$form->isValid()) {
            $errors = [];
            foreach ($form->getErrors(true) as $error) {
                $errors[] = $error->getMessage();
            }
            return $this->json(['success' => false, 'errors' => $errors], 400);
        }

        $place->setStatut(self::STATUS_PENDING);
        $place->setUser($user);
        $place->setCreateAt(new \DateTimeImmutable());

        $em->persist($place);
        $em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Établissement proposé avec succès. Il sera visible après validation.',
            'place' => [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'statut' => $place->getStatut(),
                'createAt' => $place->getCreateAt()->format(self::DATE_FORMAT),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
            ]
        ], 201);
    }

    #[Route('/api/places', name: 'api_places_list', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $places = $em->getRepository(Place::class)->findBy(['statut' => self::STATUS_VALIDATED]);
        $data = [];
        foreach ($places as $place) {
            $data[] = [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'createAt' => $place->getCreateAt()?->format('Y-m-d H:i:s'),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount(),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
            ];
        }
        return $this->json($data);
    }

    #[Route('/api/places/{id}', name: 'api_place_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(string $id, EntityManagerInterface $em): JsonResponse
    {
        $placeId = (int) $id; // Explicit conversion
        $place = $em->getRepository(Place::class)->find($placeId);
        if (!$place || $place->getStatut() !== self::STATUS_VALIDATED) {
            return $this->json(['error' => 'Établissement non trouvé ou non validé.'], 404);
        }
        return $this->json([
            'id' => $place->getId(),
            'name' => $place->getName(),
            'type' => $place->getType(),
            'adresse' => $place->getAdresse(),
            'description' => $place->getDescription(),
            'createAt' => $place->getCreateAt()?->format('Y-m-d H:i:s'),
            'latitude' => $place->getLatitude(),
            'longitude' => $place->getLongitude(),
            'averageRating' => $place->getAverageRating(),
            'reviewCount' => $place->getReviewCount(),
        ]);
    }

    #[Route('/api/admin/places', name: 'api_admin_places_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function adminList(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $queryBuilder = $em->createQueryBuilder()
            ->select('p', 'u')
            ->from(Place::class, 'p')
            ->leftJoin('p.user', 'u');

        // Filtres
        if ($name = $request->query->get('name')) {
            $queryBuilder->andWhere('p.name LIKE :name')
                ->setParameter('name', '%' . $name . '%');
        }
        if ($type = $request->query->get('type')) {
            $queryBuilder->andWhere('p.type = :type')
                ->setParameter('type', $type);
        }
        if ($status = $request->query->get('status')) {
            $queryBuilder->andWhere('p.statut = :status')
                ->setParameter('status', $status);
        }

        // Tri
        $sortBy = $request->query->get('sort_by', 'createAt');
        $sortOrder = $request->query->get('sort_order', 'DESC');
        $queryBuilder->orderBy('p.' . $sortBy, $sortOrder);

        $places = $queryBuilder->getQuery()->getResult();

        $data = [];
        foreach ($places as $place) {
            $data[] = [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'statut' => $place->getStatut(),
                'createAt' => $place->getCreateAt()?->format('Y-m-d H:i:s'),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
                'user' => [
                    'id' => $place->getUser()->getId(),
                    'pseudo' => $place->getUser()->getPseudo(),
                ]
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/places/search', name: 'api_places_search', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function search(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $queryBuilder = $em->createQueryBuilder()
            ->select('p')
            ->from(Place::class, 'p')
            ->where('p.statut = :status')
            ->setParameter('status', self::STATUS_VALIDATED);

        if ($name = $request->query->get('name')) {
            $queryBuilder->andWhere('p.name LIKE :name')
                ->setParameter('name', '%' . $name . '%');
        }

        if ($type = $request->query->get('type')) {
            $queryBuilder->andWhere('p.type = :type')
                ->setParameter('type', $type);
        }

        $lat = $request->query->get('lat');
        $lon = $request->query->get('lon');
        $radius = $request->query->get('radius') ? (float) $request->query->get('radius') : null;

        $places = $queryBuilder->getQuery()->getResult();

        $data = [];
        $totalPlaces = 0;
        $filteredByDistance = 0;

        foreach ($places as $place) {
            $totalPlaces++;
            $distance = null;
            if ($lat && $lon && $place->getLatitude() && $place->getLongitude()) {
                $distance = $this->calculateDistance($lat, $lon, $place->getLatitude(), $place->getLongitude());
                
                // Skip places outside the radius ONLY if radius is specified
                if ($radius !== null && $distance > $radius) {
                    $filteredByDistance++;
                    continue;
                }
            }

            $data[] = [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount(),
                'distance' => $distance
            ];
        }

        // Sort by distance if coordinates are provided
        if ($lat && $lon) {
            usort($data, function ($a, $b) {
                return ($a['distance'] ?? PHP_FLOAT_MAX) <=> ($b['distance'] ?? PHP_FLOAT_MAX);
            });
        }

        return $this->json($data);
    }

    #[Route('/api/places/search/filters', name: 'api_places_search_filters', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getSearchFilters(EntityManagerInterface $em): JsonResponse
    {
        // Récupérer tous les types disponibles
        $types = $em->createQueryBuilder()
            ->select('DISTINCT p.type')
            ->from(Place::class, 'p')
            ->where('p.statut = :status')
            ->setParameter('status', self::STATUS_VALIDATED)
            ->getQuery()
            ->getScalarResult();

        // Récupérer les limites géographiques des établissements
        $bounds = $em->createQueryBuilder()
            ->select('MIN(p.latitude) as minLat, MAX(p.latitude) as maxLat, MIN(p.longitude) as minLon, MAX(p.longitude) as maxLon')
            ->from(Place::class, 'p')
            ->where('p.statut = :status AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL')
            ->setParameter('status', self::STATUS_VALIDATED)
            ->getQuery()
            ->getSingleResult();

        return $this->json([
            'success' => true,
            'filters' => [
                'types' => array_column($types, 'type'),
                'radius' => [
                    'default' => 10,
                    'min' => 1,
                    'max' => 100,
                    'step' => 1,
                    'unit' => 'km'
                ],
                'geographicBounds' => [
                    'minLatitude' => (float) $bounds['minLat'],
                    'maxLatitude' => (float) $bounds['maxLat'],
                    'minLongitude' => (float) $bounds['minLon'],
                    'maxLongitude' => (float) $bounds['maxLon']
                ]
            ]
        ]);
    }

    #[Route('/api/places/types', name: 'api_places_types', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getTypes(EntityManagerInterface $em): JsonResponse
    {
        $types = $em->createQueryBuilder()
            ->select('DISTINCT p.type')
            ->from(Place::class, 'p')
            ->where('p.statut = :status')
            ->setParameter('status', self::STATUS_VALIDATED)
            ->getQuery()
            ->getScalarResult();

        return $this->json(array_column($types, 'type'));
    }

    #[Route('/api/user/places', name: 'api_user_places', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function userPlaces(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $places = $em->getRepository(Place::class)->findBy(['user' => $user]);

        $data = [];
        foreach ($places as $place) {
            $data[] = [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'statut' => $place->getStatut(),
                'createAt' => $place->getCreateAt()?->format('Y-m-d H:i:s'),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount(),
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/places/list', name: 'api_places_simple_search', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function simpleSearch(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $queryBuilder = $em->createQueryBuilder()
            ->select('p')
            ->from(Place::class, 'p')
            ->where('p.statut = :status')
            ->setParameter('status', self::STATUS_VALIDATED);

        if ($name = $request->query->get('name')) {
            $queryBuilder->andWhere('p.name LIKE :name')
                ->setParameter('name', '%' . $name . '%');
        }

        if ($type = $request->query->get('type')) {
            $queryBuilder->andWhere('p.type = :type')
                ->setParameter('type', $type);
        }

        $lat = $request->query->get('lat');
        $lon = $request->query->get('lon');
        $radius = $request->query->get('radius') ? (float) $request->query->get('radius') : null;

        $places = $queryBuilder->getQuery()->getResult();

        $data = [];
        foreach ($places as $place) {
            $distance = null;
            if ($lat && $lon && $place->getLatitude() && $place->getLongitude()) {
                $distance = $this->calculateDistance($lat, $lon, $place->getLatitude(), $place->getLongitude());
                
                // Skip places outside the radius ONLY if radius is specified
                if ($radius !== null && $distance > $radius) {
                    continue;
                }
            }

            $data[] = [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount(),
                'distance' => $distance
            ];
        }

        // Sort by distance if coordinates are provided
        if ($lat && $lon) {
            usort($data, function ($a, $b) {
                return ($a['distance'] ?? PHP_FLOAT_MAX) <=> ($b['distance'] ?? PHP_FLOAT_MAX);
            });
        }

        return $this->json($data);
    }

    #[Route('/api/places/search/detailed', name: 'api_places_search_detailed', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function detailedSearch(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $queryBuilder = $em->createQueryBuilder()
            ->select('p')
            ->from(Place::class, 'p')
            ->where('p.statut = :status')
            ->setParameter('status', self::STATUS_VALIDATED);

        if ($name = $request->query->get('name')) {
            $queryBuilder->andWhere('p.name LIKE :name')
                ->setParameter('name', '%' . $name . '%');
        }

        if ($type = $request->query->get('type')) {
            $queryBuilder->andWhere('p.type = :type')
                ->setParameter('type', $type);
        }

        $lat = $request->query->get('lat');
        $lon = $request->query->get('lon');
        $radius = $request->query->get('radius') ? (float) $request->query->get('radius') : null;

        $places = $queryBuilder->getQuery()->getResult();

        $data = [];
        $totalPlaces = 0;
        $filteredByDistance = 0;

        foreach ($places as $place) {
            $totalPlaces++;
            $distance = null;
            if ($lat && $lon && $place->getLatitude() && $place->getLongitude()) {
                $distance = $this->calculateDistance($lat, $lon, $place->getLatitude(), $place->getLongitude());
                
                // Skip places outside the radius ONLY if radius is specified
                if ($radius !== null && $distance > $radius) {
                    $filteredByDistance++;
                    continue;
                }
            }

            $data[] = [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount(),
                'distance' => $distance
            ];
        }

        // Sort by distance if coordinates are provided
        if ($lat && $lon) {
            usort($data, function ($a, $b) {
                return ($a['distance'] ?? PHP_FLOAT_MAX) <=> ($b['distance'] ?? PHP_FLOAT_MAX);
            });
        }

        return $this->json([
            'success' => true,
            'results' => $data,
            'filters' => [
                'name' => $name,
                'type' => $type,
                'latitude' => $lat ? (float) $lat : null,
                'longitude' => $lon ? (float) $lon : null,
                'radius' => $radius,
            ],
            'statistics' => [
                'totalFound' => count($data),
                'totalInDatabase' => $totalPlaces,
                'filteredByDistance' => $filteredByDistance,
                'hasLocationFilter' => !empty($lat) && !empty($lon)
            ]
        ]);
    }

    #[Route('/api/places/search/debug', name: 'api_places_search_debug', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function searchDebug(Request $request): JsonResponse
    {
        return $this->json([
            'queryParams' => $request->query->all(),
            'lat' => $request->query->get('lat'),
            'lon' => $request->query->get('lon'),
            'radius' => $request->query->get('radius'),
            'radiusType' => gettype($request->query->get('radius')),
            'radiusIsNull' => $request->query->get('radius') === null,
            'radiusIsEmpty' => empty($request->query->get('radius')),
            'url' => $request->getUri()
        ]);
    }

    #[Route('/api/places/all', name: 'api_places_all', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function allPlaces(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $queryBuilder = $em->createQueryBuilder()
            ->select('p')
            ->from(Place::class, 'p')
            ->where('p.statut = :status')
            ->setParameter('status', self::STATUS_VALIDATED);

        if ($name = $request->query->get('name')) {
            $queryBuilder->andWhere('p.name LIKE :name')
                ->setParameter('name', '%' . $name . '%');
        }

        if ($type = $request->query->get('type')) {
            $queryBuilder->andWhere('p.type = :type')
                ->setParameter('type', $type);
        }

        $lat = $request->query->get('lat');
        $lon = $request->query->get('lon');

        $places = $queryBuilder->getQuery()->getResult();

        $data = [];
        foreach ($places as $place) {
            $distance = null;
            if ($lat && $lon && $place->getLatitude() && $place->getLongitude()) {
                $distance = $this->calculateDistance($lat, $lon, $place->getLatitude(), $place->getLongitude());
            }

            $data[] = [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount(),
                'distance' => $distance
            ];
        }

        // Sort by distance if coordinates are provided, but NEVER filter by radius
        if ($lat && $lon) {
            usort($data, function ($a, $b) {
                return ($a['distance'] ?? PHP_FLOAT_MAX) <=> ($b['distance'] ?? PHP_FLOAT_MAX);
            });
        }

        return $this->json($data);
    }

    #[Route('/api/places/search/no-radius', name: 'api_places_search_no_radius', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function searchWithoutRadius(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $queryBuilder = $em->createQueryBuilder()
            ->select('p')
            ->from(Place::class, 'p')
            ->where('p.statut = :status')
            ->setParameter('status', self::STATUS_VALIDATED);

        if ($name = $request->query->get('name')) {
            $queryBuilder->andWhere('p.name LIKE :name')
                ->setParameter('name', '%' . $name . '%');
        }

        if ($type = $request->query->get('type')) {
            $queryBuilder->andWhere('p.type = :type')
                ->setParameter('type', $type);
        }

        $lat = $request->query->get('lat');
        $lon = $request->query->get('lon');
        // JAMAIS de filtre par radius sur cette route

        $places = $queryBuilder->getQuery()->getResult();

        $data = [];
        foreach ($places as $place) {
            $distance = null;
            if ($lat && $lon && $place->getLatitude() && $place->getLongitude()) {
                $distance = $this->calculateDistance($lat, $lon, $place->getLatitude(), $place->getLongitude());
            }

            $data[] = [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'type' => $place->getType(),
                'adresse' => $place->getAdresse(),
                'description' => $place->getDescription(),
                'latitude' => $place->getLatitude(),
                'longitude' => $place->getLongitude(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount(),
                'distance' => $distance
            ];
        }

        // Sort by distance if coordinates are provided, but NEVER filter
        if ($lat && $lon) {
            usort($data, function ($a, $b) {
                return ($a['distance'] ?? PHP_FLOAT_MAX) <=> ($b['distance'] ?? PHP_FLOAT_MAX);
            });
        }

        return $this->json($data);
    }

    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return round($earthRadius * $c, 2);
    }
}