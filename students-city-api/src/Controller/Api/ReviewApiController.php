<?php

namespace App\Controller\Api;

use App\Entity\Review;
use App\Entity\Place;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ReviewApiController extends AbstractController
{
    #[Route('/api/reviews', name: 'api_reviews_list', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $reviews = $em->getRepository(Review::class)->findBy(['user' => $user]);
        $data = [];
        foreach ($reviews as $review) {
            $data[] = [
                'id' => $review->getId(),
                'place' => [
                    'id' => $review->getPlace()->getId(),
                    'name' => $review->getPlace()->getName(),
                ],
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s'),
            ];
        }
        return $this->json($data);
    }

    #[Route('/api/reviews', name: 'api_review_create', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['place_id'], $data['commentaire'], $data['rating'])) {
            return $this->json(['success' => false, 'message' => 'Champs manquants'], 400);
        }

        $place = $em->getRepository(Place::class)->find($data['place_id']);
        if (!$place || strtolower($place->getStatut()) !== 'validé') {
            return $this->json(['success' => false, 'message' => 'Établissement non trouvé ou non validé'], 404);
        }

        // Vérifier si l'utilisateur a déjà noté cet établissement
        $existing = $em->getRepository(Review::class)->findOneBy([
            'user' => $user,
            'place' => $place
        ]);
        if ($existing) {
            return $this->json([
                'success' => false, 
                'message' => 'Vous avez déjà noté cet établissement.',
                'existingReview' => [
                    'id' => $existing->getId(),
                    'commentaire' => $existing->getCommentaire(),
                    'rating' => $existing->getRating(),
                    'createAt' => $existing->getCreateAt()?->format('Y-m-d H:i:s')
                ],
                'canEdit' => true
            ], 400);
        }

        $review = new Review();
        $review->setUser($user);
        $review->setPlace($place);
        $review->setCommentaire($data['commentaire']);
        $review->setRating((int)$data['rating']);
        $review->setCreateAt(new \DateTimeImmutable());
        $review->setStatut('en attente');

        $em->persist($review);
        $em->flush();

        return $this->json([
            'success' => true, 
            'message' => 'Avis ajouté avec succès',
            'review' => [
                'id' => $review->getId(),
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s')
            ],
            'place' => [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount()
            ],
            'shouldRefresh' => true
        ]);
    }

    #[Route('/api/reviews/{id}', name: 'api_review_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function update(Request $request, int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $review = $em->getRepository(Review::class)->find($id);

        if (!$review || $review->getUser() !== $user) {
            return $this->json(['success' => false, 'message' => 'Avis non trouvé ou non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (isset($data['commentaire'])) {
            $review->setCommentaire($data['commentaire']);
        }
        if (isset($data['rating'])) {
            $review->setRating((int)$data['rating']);
        }
        $em->flush();

        // Récupérer les données mises à jour de l'établissement
        $place = $review->getPlace();

        return $this->json([
            'success' => true, 
            'message' => 'Avis modifié avec succès',
            'review' => [
                'id' => $review->getId(),
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s')
            ],
            'place' => [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount()
            ],
            'shouldRefresh' => true
        ]);
    }

    #[Route('/api/reviews/{id}', name: 'api_review_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function delete(Request $request, int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $review = $em->getRepository(Review::class)->find($id);

        if (!$review || $review->getUser() !== $user) {
            return $this->json(['success' => false, 'message' => 'Avis non trouvé ou non autorisé'], 403);
        }

        $place = $review->getPlace();
        $em->remove($review);
        $em->flush();

        return $this->json([
            'success' => true, 
            'message' => 'Avis supprimé avec succès',
            'place' => [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount()
            ],
            'shouldRefresh' => true
        ]);
    }

    #[Route('/api/reviews/', name: 'api_reviews_all', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function all(EntityManagerInterface $em): JsonResponse
    {
        $reviews = $em->getRepository(Review::class)->findAll();
        $data = [];
        foreach ($reviews as $review) {
            $data[] = [
                'id' => $review->getId(),
                'place' => [
                    'id' => $review->getPlace()->getId(),
                    'name' => $review->getPlace()->getName(),
                ],
                'user' => [
                    'id' => $review->getUser()->getId(),
                    'pseudo' => $review->getUser()->getPseudo(),
                ],
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s'),
            ];
        }
        return $this->json($data);
    }

    #[Route('/api/reviews/{id}', name: 'api_review_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(int $id, EntityManagerInterface $em): JsonResponse
    {
        $review = $em->getRepository(Review::class)->find($id);
        if (!$review) {
            return $this->json(['error' => 'Avis non trouvé'], 404);
        }
        return $this->json([
            'id' => $review->getId(),
            'place' => [
                'id' => $review->getPlace()->getId(),
                'name' => $review->getPlace()->getName(),
            ],
            'user' => [
                'id' => $review->getUser()->getId(),
                'pseudo' => $review->getUser()->getPseudo(),
            ],
            'commentaire' => $review->getCommentaire(),
            'rating' => $review->getRating(),
            'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s'),
        ]);
    }  

    #[Route('/api/places/{id}/reviews', name: 'api_place_reviews_old', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function placeReviews(int $id, EntityManagerInterface $em): JsonResponse
    {
        $place = $em->getRepository(Place::class)->find($id);
        if (!$place) {
            return $this->json(['error' => 'Établissement non trouvé'], 404);
        }

        $reviews = $em->getRepository(Review::class)->findBy(
            ['place' => $place],
            ['createAt' => 'DESC']
        );

        $data = [];
        foreach ($reviews as $review) {
            $data[] = [
                'id' => $review->getId(),
                'user' => [
                    'id' => $review->getUser()->getId(),
                    'pseudo' => $review->getUser()->getPseudo(),
                ],
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s'),
                'canEdit' => $review->getUser() === $this->getUser()
            ];
        }

        return $this->json([
            'reviews' => $data,
            'averageRating' => $place->getAverageRating(),
            'reviewCount' => $place->getReviewCount()
        ]);
    }

    #[Route('/api/places/{placeId}/review', name: 'api_place_review_upsert', methods: ['POST'], requirements: ['placeId' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function upsertReview(int $placeId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['commentaire'], $data['rating'])) {
            return $this->json(['success' => false, 'message' => 'Champs manquants'], 400);
        }

        $place = $em->getRepository(Place::class)->find($placeId);
        if (!$place || strtolower($place->getStatut()) !== 'validé') {
            return $this->json(['success' => false, 'message' => 'Établissement non trouvé ou non validé'], 404);
        }

        // Chercher un avis existant
        $review = $em->getRepository(Review::class)->findOneBy([
            'user' => $user,
            'place' => $place
        ]);

        $isNewReview = false;
        if (!$review) {
            // Créer un nouvel avis
            $review = new Review();
            $review->setUser($user);
            $review->setPlace($place);
            $review->setCreateAt(new \DateTimeImmutable());
            $review->setStatut('en attente');
            $isNewReview = true;
        }

        // Mettre à jour les données
        $review->setCommentaire($data['commentaire']);
        $review->setRating((int)$data['rating']);

        if ($isNewReview) {
            $em->persist($review);
        }
        $em->flush();

        // Rafraîchir l'entité place pour recalculer les moyennes
        $em->refresh($place);

        return $this->json([
            'success' => true, 
            'message' => $isNewReview ? 'Avis ajouté avec succès' : 'Avis mis à jour avec succès',
            'review' => [
                'id' => $review->getId(),
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s')
            ],
            'place' => [
                'id' => $place->getId(),
                'name' => $place->getName(),
                'averageRating' => $place->getAverageRating(),
                'reviewCount' => $place->getReviewCount()
            ],
            'isNewReview' => $isNewReview,
            'shouldRefresh' => true
        ]);
    }

    #[Route('/api/places/{placeId}/reviews', name: 'api_place_reviews', methods: ['GET'], requirements: ['placeId' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getPlaceReviews(int $placeId, EntityManagerInterface $em): JsonResponse
    {
        $place = $em->getRepository(Place::class)->find($placeId);
        if (!$place || strtolower($place->getStatut()) !== 'validé') {
            return $this->json(['success' => false, 'message' => 'Établissement non trouvé ou non validé'], 404);
        }

        $reviews = $em->getRepository(Review::class)->findBy(
            ['place' => $place], 
            ['createAt' => 'DESC']
        );

        $data = [];
        foreach ($reviews as $review) {
            $data[] = [
                'id' => $review->getId(),
                'user' => [
                    'id' => $review->getUser()->getId(),
                    'pseudo' => $review->getUser()->getPseudo()
                ],
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s'),
                'statut' => $review->getStatut(),
                'canEdit' => $review->getUser() === $this->getUser()
            ];
        }

        return $this->json([
            'success' => true,
            'averageRating' => $place->getAverageRating(),
            'reviewCount' => $place->getReviewCount(),
            'place' => [
                'id' => $place->getId(),
                'name' => $place->getName(),
            ],
            'reviews' => $data
        ]);
    }
}